"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const productGrid = document.querySelector("#product-grid");
const catalogStatus = document.querySelector("#catalog-status");
const categoryFilter = document.querySelector("#category-filter");
const productTemplate = document.querySelector("#product-card-template");
const cartTemplate = document.querySelector("#cart-row-template");
const cartDialog = document.querySelector("#cart-dialog");
const cartItemsElement = document.querySelector("#cart-items");
const cartStatus = document.querySelector("#cart-status");
const contactForm = document.querySelector(".contact-form");
const cartStorageKey = "dermakor-cart-v1";
const categoryStorageKey = "dermakor-category-v1";
const databaseName = "dermakor-catalog-v1";
const databaseVersion = 1;
const cartItems = new Map();
const productsById = new Map();
let catalogProducts = [];
let lastCartUpdate = null;
let catalogLoadNotice = "";

const moneyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

function closeMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menú");
  menuToggle.querySelector(".visually-hidden").textContent = "Abrir menú";
  mainNav.classList.remove("is-open");
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
    menuToggle.querySelector(".visually-hidden").textContent = isOpen ? "Abrir menú" : "Cerrar menú";
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

function openCatalogDatabase() {
  return new Promise((resolve) => {
    if (!("indexedDB" in window)) {
      resolve(null);
      return;
    }

    const request = indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products", { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains("metadata")) {
        database.createObjectStore("metadata", { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
  });
}

async function saveCatalogCache(products, updatedAt) {
  const database = await openCatalogDatabase();
  if (!database) return;

  await new Promise((resolve, reject) => {
    const transaction = database.transaction(["products", "metadata"], "readwrite");
    const store = transaction.objectStore("products");
    store.clear();
    products.forEach((product) => store.put(product));
    transaction.objectStore("metadata").put({ key: "catalog", updatedAt });
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

async function readCatalogCache() {
  const database = await openCatalogDatabase();
  if (!database) return null;

  const result = await new Promise((resolve, reject) => {
    const transaction = database.transaction(["products", "metadata"], "readonly");
    const productsRequest = transaction.objectStore("products").getAll();
    const metadataRequest = transaction.objectStore("metadata").get("catalog");
    transaction.oncomplete = () => resolve({
      products: productsRequest.result,
      updatedAt: metadataRequest.result?.updatedAt,
    });
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  return result;
}

function isValidCatalog(catalog) {
  return Boolean(
    catalog &&
    catalog.currency === "USD" &&
    Number.isFinite(Date.parse(catalog.updatedAt)) &&
    Array.isArray(catalog.products) &&
    catalog.products.length > 0 &&
    catalog.products.every((product) =>
      typeof product.id === "string" &&
      typeof product.name === "string" &&
      typeof product.category === "string" &&
      typeof product.description === "string" &&
      Number.isFinite(product.price) &&
      product.price > 0 &&
      typeof product.image === "string" &&
      typeof product.imageAlt === "string",
    ),
  );
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getSelectedCategory() {
  try {
    return sessionStorage.getItem(categoryStorageKey) || "all";
  } catch {
    return "all";
  }
}

function saveSelectedCategory(category) {
  try {
    sessionStorage.setItem(categoryStorageKey, category);
  } catch {
    // Session storage can be disabled; filtering still works for this page view.
  }
}

function createProductCard(product) {
  const card = productTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector(".product-image");
  const addButton = card.querySelector(".product-add");
  card.dataset.productId = product.id;
  image.src = product.image;
  image.alt = product.imageAlt;
  image.addEventListener("error", () => {
    image.removeAttribute("src");
    image.alt = `${product.name}: imagen no disponible`;
    image.classList.add("image-unavailable");
  }, { once: true });
  card.querySelector(".tag").textContent = product.category;
  card.querySelector("h3").textContent = product.name;
  card.querySelector(".product-description").textContent = product.description;
  card.querySelector(".product-price").textContent = `${moneyFormatter.format(product.price)} · precio referencial`;
  addButton.dataset.productId = product.id;
  addButton.setAttribute("aria-label", `Agregar ${product.name} al carrito`);
  return card;
}

function renderProducts() {
  if (!productGrid) return;
  const category = categoryFilter.value;
  const visibleProducts = category === "all"
    ? catalogProducts
    : catalogProducts.filter((product) => product.category === category);
  const fragment = document.createDocumentFragment();
  visibleProducts.forEach((product) => fragment.append(createProductCard(product)));
  productGrid.replaceChildren(fragment);
  const resultMessage = visibleProducts.length
    ? `${visibleProducts.length} productos disponibles en esta categoría.`
    : "No hay productos en esta categoría.";
  catalogStatus.textContent = `${catalogLoadNotice} ${resultMessage}`.trim();
}

function populateCategoryFilter() {
  const categories = [...new Set(catalogProducts.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.append(option);
  });
  const savedCategory = getSelectedCategory();
  categoryFilter.value = categories.includes(savedCategory) ? savedCategory : "all";
  categoryFilter.addEventListener("change", () => {
    saveSelectedCategory(categoryFilter.value);
    renderProducts();
  });
}

async function loadCatalog() {
  productGrid.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("data/products.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("No se pudo leer data/products.json.");
    const catalog = await response.json();
    if (!isValidCatalog(catalog)) throw new Error("El catálogo local no tiene el formato esperado.");
    catalogProducts = catalog.products;
    await saveCatalogCache(catalog.products, catalog.updatedAt).catch(() => {});
    updateCatalogTimestamp(catalog.updatedAt);
    catalogLoadNotice = "Catálogo local cargado.";
  } catch {
    try {
      const cachedCatalog = await readCatalogCache();
      if (!cachedCatalog?.products?.length) throw new Error("Sin catálogo en caché.");
      catalogProducts = cachedCatalog.products;
      updateCatalogTimestamp(cachedCatalog.updatedAt);
      catalogLoadNotice = "Sin conexión: se usa el catálogo guardado en este dispositivo.";
    } catch {
      catalogStatus.textContent = "No se pudo cargar el catálogo. Abre la página desde un servidor local o vuelve a intentarlo.";
      productGrid.setAttribute("aria-busy", "false");
      return;
    }
  }

  catalogProducts.forEach((product) => productsById.set(product.id, product));
  populateCategoryFilter();
  productGrid.setAttribute("aria-busy", "false");
  renderProducts();
  renderCart();
}

function updateCatalogTimestamp(updatedAt) {
  const timeElement = document.querySelector("#catalog-updated");
  if (!timeElement) return;
  const date = new Date(updatedAt);
  timeElement.textContent = formatDate(updatedAt);
  if (!Number.isNaN(date.getTime())) timeElement.dateTime = date.toISOString();
}

function readCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || "{}");
    if (savedCart.items && typeof savedCart.items === "object") {
      Object.entries(savedCart.items).forEach(([id, quantity]) => {
        if (typeof id === "string" && Number.isInteger(quantity) && quantity > 0 && quantity <= 99) {
          cartItems.set(id, quantity);
        }
      });
      lastCartUpdate = savedCart.updatedAt || null;
    }
  } catch {
    cartItems.clear();
  }
}

function writeUpdateCookie(updatedAt) {
  try {
    const secureFlag = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `dermakor_cart_updated=${encodeURIComponent(updatedAt)}; Max-Age=31536000; Path=/; SameSite=Lax${secureFlag}`;
  } catch {
    // The cart timestamp remains in localStorage if cookies are disabled.
  }
}

function persistCart() {
  lastCartUpdate = new Date().toISOString();
  const items = Object.fromEntries(cartItems);
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify({ items, updatedAt: lastCartUpdate }));
  } catch {
    announceCart("No se pudo guardar el carrito en este navegador.");
  }
  writeUpdateCookie(lastCartUpdate);
  renderCart();
}

function updateCartTimestamp() {
  const timeElement = document.querySelector("#cart-updated");
  if (!timeElement) return;
  if (!lastCartUpdate) {
    timeElement.textContent = "Sin cambios";
    timeElement.removeAttribute("datetime");
    return;
  }
  timeElement.dateTime = lastCartUpdate;
  timeElement.textContent = formatDate(lastCartUpdate);
}

function announceCart(message) {
  cartStatus.textContent = "";
  window.requestAnimationFrame(() => {
    cartStatus.textContent = message;
  });
}

function renderCart() {
  if (!cartItemsElement) return;
  const fragment = document.createDocumentFragment();
  let subtotalCents = 0;
  let itemCount = 0;

  for (const [id, quantity] of cartItems) {
    const product = productsById.get(id);
    if (!product) continue;
    subtotalCents += Math.round(product.price * 100) * quantity;
    itemCount += quantity;

    const row = cartTemplate.content.firstElementChild.cloneNode(true);
    const image = row.querySelector(".cart-item-image");
    image.src = product.image;
    image.alt = product.imageAlt;
    row.querySelector("h3").textContent = product.name;
    row.querySelector(".cart-item-price").textContent = `${moneyFormatter.format(product.price)} cada uno`;
    const quantityInput = row.querySelector(".cart-quantity");
    quantityInput.value = String(quantity);
    quantityInput.setAttribute("aria-label", `Cantidad de ${product.name}`);
    row.querySelector(".quantity-label").setAttribute("for", `quantity-${product.id}`);
    quantityInput.id = `quantity-${product.id}`;
    row.querySelector(".cart-remove").dataset.productId = product.id;
    row.querySelector(".cart-remove").setAttribute("aria-label", `Eliminar ${product.name} del carrito`);
    row.dataset.productId = product.id;
    fragment.append(row);
  }

  cartItemsElement.replaceChildren(fragment);
  document.querySelector("#cart-empty").hidden = itemCount > 0;
  const subtotal = subtotalCents / 100;
  document.querySelector("#cart-subtotal").textContent = moneyFormatter.format(subtotal);
  document.querySelector("#cart-total").textContent = moneyFormatter.format(subtotal);
  const cartCount = document.querySelector("#cart-count");
  cartCount.textContent = String(itemCount);
  cartCount.setAttribute("aria-label", `${itemCount} ${itemCount === 1 ? "artículo" : "artículos"}`);
  document.querySelector("#cart-clear").disabled = itemCount === 0;
  updateCartTimestamp();
}

function addToCart(productId) {
  const product = productsById.get(productId);
  if (!product) return;
  const quantity = cartItems.get(productId) || 0;
  if (quantity >= 99) {
    catalogStatus.textContent = `Alcanzaste el máximo de 99 unidades de ${product.name}.`;
    return;
  }
  cartItems.set(productId, quantity + 1);
  persistCart();
  catalogStatus.textContent = `${product.name} agregado. El carrito tiene ${[...cartItems.values()].reduce((sum, value) => sum + value, 0)} artículos.`;
}

function updateCartItem(productId, nextQuantity) {
  if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
    cartItems.delete(productId);
  } else {
    cartItems.set(productId, Math.min(nextQuantity, 99));
  }
  persistCart();
}

document.querySelector("#cart-open").addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});
document.querySelector("#cart-close").addEventListener("click", () => cartDialog.close());
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) cartDialog.close();
});
document.querySelector("#cart-clear").addEventListener("click", () => {
  cartItems.clear();
  persistCart();
  announceCart("Se vació el carrito.");
});
productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest(".product-add");
  if (addButton) addToCart(addButton.dataset.productId);
});
cartItemsElement.addEventListener("change", (event) => {
  const quantityInput = event.target.closest(".cart-quantity");
  if (!quantityInput) return;
  const productId = quantityInput.closest(".cart-item").dataset.productId;
  updateCartItem(productId, Number.parseInt(quantityInput.value, 10));
  announceCart("Cantidad del carrito actualizada.");
});
cartItemsElement.addEventListener("click", (event) => {
  const removeButton = event.target.closest(".cart-remove");
  if (!removeButton) return;
  const product = productsById.get(removeButton.dataset.productId);
  cartItems.delete(removeButton.dataset.productId);
  persistCart();
  announceCart(`${product?.name || "Producto"} eliminado del carrito.`);
});

const validationRules = {
  nombre: {
    pattern: /^[\p{L}\p{M}][\p{L}\p{M}'’ -]{1,79}$/u,
    message: "Escribe un nombre de 2 a 80 caracteres, usando letras, espacios, apóstrofos o guiones.",
  },
  empresa: {
    pattern: /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'’&()/-]{1,99}$/u,
    message: "Escribe un nombre de empresa de 2 a 100 caracteres.",
  },
  correo: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u,
    message: "Escribe un correo válido, por ejemplo nombre@dominio.com.",
  },
  telefono: {
    pattern: /^\+?[0-9][0-9().\s-]{6,18}$/u,
    message: "Escribe un teléfono válido con al menos 7 dígitos.",
  },
};

function validateField(field) {
  const rule = validationRules[field.name];
  if (!rule) return true;
  const value = field.value.trim();
  const isOptionalEmptyPhone = field.name === "telefono" && value === "";
  const phoneDigitCount = field.name === "telefono" ? (value.match(/\d/g) || []).length : 0;
  const isValid = isOptionalEmptyPhone || (
    rule.pattern.test(value) &&
    (field.name !== "telefono" || phoneDigitCount >= 7)
  );
  const errorElement = document.querySelector(`#${field.id}-error`);
  field.setAttribute("aria-invalid", String(!isValid));
  errorElement.textContent = isValid ? "" : rule.message;
  return isValid;
}

if (contactForm) {
  const contactStatus = document.querySelector("#contact-status");
  const fields = [...contactForm.querySelectorAll("input[name]")];
  fields.forEach((field) => {
    field.addEventListener("input", () => {
      validateField(field);
      contactStatus.textContent = "";
    });
    field.addEventListener("blur", () => validateField(field));
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalidFields = fields.filter((field) => !validateField(field));
    if (invalidFields.length) {
      contactStatus.textContent = "Revisa los campos marcados antes de continuar.";
      invalidFields[0].focus();
      return;
    }
    contactStatus.textContent = "Los datos son válidos, pero esta página todavía no está conectada a un servicio de envío. No se envió la solicitud.";
  });
}

readCart();
renderCart();
loadCatalog();