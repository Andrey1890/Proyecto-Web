"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const productGrid = document.querySelector("#product-grid");
const catalogStatus = document.querySelector("#catalog-status");
const categoryFilter = document.querySelector("#category-filter");
const productSearch = document.querySelector("#product-search");
const productTemplate = document.querySelector("#product-card-template");
const cartTemplate = document.querySelector("#cart-row-template");
const cartDialog = document.querySelector("#cart-dialog");
const cartView = document.querySelector("#cart-view");
const checkoutView = document.querySelector("#checkout-view");
const cartItemsElement = document.querySelector("#cart-items");
const cartStatus = document.querySelector("#cart-status");
const contactForm = document.querySelector(".contact-form");
const contactProductSelect = document.querySelector("#contact-line");
const cartStorageKey = "dermakor-cart-v1";
const categoryStorageKey = "dermakor-category-v1";
const databaseName = "dermakor-catalog-v1";
const databaseVersion = 1;
const cartItems = new Map();
const productsById = new Map();
let catalogProducts = [];
let lastCartUpdate = null;
let catalogLoadNotice = "";
let shippingDetails = null;
let checkoutStep = "shipping";

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
    request.onerror = () => {
      console.error("No se pudo abrir la base de datos local del catálogo.", request.error);
      resolve(null);
    };
    request.onblocked = () => {
      console.error("La base de datos del catálogo está bloqueada por otra pestaña.");
      resolve(null);
    };
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
  card.querySelector(".product-size").textContent = product.size || "";
  card.querySelector(".product-description").textContent = product.description;
  card.querySelector(".product-price").textContent = `${moneyFormatter.format(product.price)} · PVP de referencia`;
  addButton.dataset.productId = product.id;
  addButton.setAttribute("aria-label", `Agregar ${product.name} al carrito`);
  return card;
}

function renderProducts() {
  if (!productGrid) return;
  const category = categoryFilter.value;
  const categoryProducts = category === "all"
    ? catalogProducts
    : catalogProducts.filter((product) => product.category === category);
  const query = productSearch.value.trim().toLocaleLowerCase("es");
  const visibleProducts = query
    ? categoryProducts.filter((product) =>
      [product.name, product.category, product.description, product.size]
        .some((value) => value?.toLocaleLowerCase("es").includes(query)),
    )
    : categoryProducts;
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
  productSearch.addEventListener("input", renderProducts);
  const productOptions = catalogProducts.map((product) => {
    const option = document.createElement("option");
    option.value = product.name;
    option.textContent = product.name;
    return option;
  });
  contactProductSelect.append(...productOptions);
}

async function loadCatalog() {
  productGrid.setAttribute("aria-busy", "true");
  let catalog;
  try {
    if (location.protocol === "file:") {
      const fallback = document.querySelector("#catalog-fallback");
      if (!fallback) throw new Error("No está disponible el catálogo integrado para la apertura local.");
      catalog = JSON.parse(fallback.textContent);
      catalogLoadNotice = "Catálogo integrado para apertura local.";
    } else {
      try {
        const response = await fetch("data/products.json", { cache: "no-cache" });
        if (!response.ok) throw new Error(`No se pudo leer data/products.json (HTTP ${response.status}).`);
        catalog = await response.json();
        catalogLoadNotice = "Catálogo local cargado.";
      } catch (networkError) {
        console.warn("No se pudo cargar el archivo JSON del catálogo.", networkError);
        const cachedCatalog = await readCatalogCache();
        if (!cachedCatalog?.products?.length) throw networkError;
        catalog = {
          currency: "USD",
          updatedAt: cachedCatalog.updatedAt,
          products: cachedCatalog.products,
        };
        catalogLoadNotice = "Sin conexión: se usa el catálogo guardado en este dispositivo.";
      }
    }
    if (!isValidCatalog(catalog)) throw new Error("El catálogo local no tiene el formato esperado.");
  } catch (error) {
    console.error("No se pudo cargar un catálogo válido.", error);
    catalogStatus.textContent = "No se pudo cargar un catálogo válido. Comprueba data/products.json o vuelve a abrir la página.";
    productGrid.setAttribute("aria-busy", "false");
    return;
  }

  catalogProducts = catalog.products;
  try {
    await saveCatalogCache(catalog.products, catalog.updatedAt);
  } catch (error) {
    console.error("No se pudo guardar la copia local del catálogo.", error);
    catalogLoadNotice += " No se pudo guardar una copia sin conexión.";
  }
  updateCatalogTimestamp(catalog.updatedAt);

  catalogProducts.forEach((product) => productsById.set(product.id, product));
  for (const id of cartItems.keys()) {
    if (!productsById.has(id)) cartItems.delete(id);
  }
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
    console.error("No se pudo leer el carrito guardado en este navegador.");
    cartItems.clear();
    announceCart("No se pudo leer el carrito guardado. Puedes continuar con un carrito nuevo.");
  }
}

function writeUpdateCookie(updatedAt) {
  try {
    const secureFlag = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `dermakor_cart_updated=${encodeURIComponent(updatedAt)}; Max-Age=31536000; Path=/; SameSite=Lax${secureFlag}`;
  } catch {
    console.warn("No se pudo guardar la fecha del carrito en una cookie.");
  }
}

function persistCart() {
  lastCartUpdate = new Date().toISOString();
  const items = Object.fromEntries(cartItems);
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify({ items, updatedAt: lastCartUpdate }));
  } catch {
    console.error("No se pudo guardar el carrito en localStorage.");
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
  const quoteLink = document.querySelector("#cart-quote");
  const checkoutButton = document.querySelector("#checkout-open");
  checkoutButton.disabled = itemCount === 0;
  if (quoteLink) {
    const lines = [...cartItems].flatMap(([id, quantity]) => {
      const product = productsById.get(id);
      return product
        ? [`- ${product.name}${product.size ? ` (${product.size})` : ""} x ${quantity}: ${moneyFormatter.format(Math.round(product.price * 100) * quantity / 100)}`]
        : [];
    });
    const message = [
      "Hola, quisiera consultar disponibilidad y solicitar una cotización no vinculante:",
      ...lines,
      `Subtotal de referencia: ${moneyFormatter.format(subtotal)}.`,
      "Por favor, confírmame disponibilidad, envío e impuestos. Este mensaje no confirma un pedido.",
    ].join("\n");
    quoteLink.href = `https://wa.me/593996096996?text=${encodeURIComponent(message)}`;
    quoteLink.setAttribute("aria-disabled", String(itemCount === 0));
    quoteLink.tabIndex = itemCount === 0 ? -1 : 0;
  }
  renderCheckoutSummary(subtotal, itemCount);
  updateCartTimestamp();
}

function renderCheckoutSummary(subtotal, itemCount) {
  const summaryList = document.querySelector("#checkout-summary-items");
  const fragment = document.createDocumentFragment();
  const reviewList = document.querySelector("#review-products");
  const reviewFragment = document.createDocumentFragment();
  for (const [id, quantity] of cartItems) {
    const product = productsById.get(id);
    if (!product) continue;
    const lineTotal = Math.round(product.price * 100) * quantity / 100;
    const item = document.createElement("li");
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.imageAlt;
    image.width = 54;
    image.height = 54;
    const details = document.createElement("span");
    details.textContent = `${product.name} · ${product.size || ""} · Cantidad ${quantity}`;
    const price = document.createElement("output");
    price.textContent = moneyFormatter.format(lineTotal);
    item.append(image, details, price);
    fragment.append(item);

    const reviewItem = document.createElement("li");
    reviewItem.textContent = `${product.name} (${product.size || "presentación por confirmar"}) × ${quantity} · ${moneyFormatter.format(lineTotal)}`;
    reviewFragment.append(reviewItem);
  }
  summaryList.replaceChildren(fragment);
  reviewList.replaceChildren(reviewFragment);
  document.querySelector("#checkout-item-count").textContent = `${itemCount} ${itemCount === 1 ? "artículo" : "artículos"}`;
  document.querySelector("#checkout-subtotal").textContent = moneyFormatter.format(subtotal);
  document.querySelector("#checkout-total").textContent = moneyFormatter.format(subtotal);
  document.querySelector("#review-subtotal").textContent = moneyFormatter.format(subtotal);
  document.querySelector("#review-total").textContent = moneyFormatter.format(subtotal);
}

const checkoutTitles = {
  shipping: "Completa tu solicitud",
  payment: "Pago",
  confirmation: "Revisión antes de solicitar",
};

function showCheckoutStep(step) {
  checkoutStep = step;
  cartDialog.classList.add("is-checkout");
  cartView.hidden = true;
  checkoutView.hidden = false;
  document.querySelector("#cart-title").textContent = checkoutTitles[step];
  for (const element of document.querySelectorAll(".checkout-step")) {
    element.hidden = element.id !== `checkout-step-${step}`;
  }
  for (const indicator of document.querySelectorAll("[data-checkout-indicator]")) {
    if (indicator.dataset.checkoutIndicator === step) {
      indicator.setAttribute("aria-current", "step");
    } else {
      indicator.removeAttribute("aria-current");
    }
  }
  if (step === "payment") {
    const details = shippingDetails;
    document.querySelector("#payment-address-summary").textContent =
      `Datos de envío: ${details.nombre} ${details.apellidos}, ${details.ciudad}, ${details.provincia}.`;
  }
  if (step === "confirmation" && shippingDetails) {
    document.querySelector("#review-address").textContent =
      `${shippingDetails.nombre} ${shippingDetails.apellidos}\nCorreo: ${shippingDetails.email}\nTeléfono: ${shippingDetails.telefono}\nDirección: ${shippingDetails.calle}${shippingDetails.referencia ? `, ${shippingDetails.referencia}` : ""}, ${shippingDetails.ciudad}, ${shippingDetails.provincia}${shippingDetails.codigoPostal ? `, ${shippingDetails.codigoPostal}` : ""}`;
    const productLines = [...cartItems].flatMap(([id, quantity]) => {
      const product = productsById.get(id);
      return product ? [`- ${product.name} (${product.size || "presentación por confirmar"}) x ${quantity}: ${moneyFormatter.format(Math.round(product.price * 100) * quantity / 100)}`] : [];
    });
    const message = [
      "Hola, quisiera solicitar una cotización no vinculante de estos productos Dermaclar:",
      ...productLines,
      `Subtotal de referencia: ${moneyFormatter.format([...cartItems].reduce((sum, [id, quantity]) => sum + (productsById.get(id) ? Math.round(productsById.get(id).price * 100) * quantity : 0), 0) / 100)}.`,
      `Nombre: ${shippingDetails.nombre} ${shippingDetails.apellidos}.`,
      `Correo: ${shippingDetails.email}.`,
      `Teléfono: ${shippingDetails.telefono}.`,
      `Dirección: ${shippingDetails.calle}${shippingDetails.referencia ? `, ${shippingDetails.referencia}` : ""}, ${shippingDetails.ciudad}, ${shippingDetails.provincia}${shippingDetails.codigoPostal ? `, ${shippingDetails.codigoPostal}` : ""}.`,
      "Por favor, confirma disponibilidad, envío, impuestos y forma de pago. Este mensaje no confirma un pedido.",
    ].join("\n");
    document.querySelector("#checkout-whatsapp").href =
      `https://wa.me/593996096996?text=${encodeURIComponent(message)}`;
  }
  cartDialog.scrollTop = 0;
  const activeHeading = document.querySelector(`#checkout-step-${step} h3`);
  if (activeHeading) activeHeading.focus({ preventScroll: true });
}

cartDialog.addEventListener("close", () => {
  cartDialog.classList.remove("is-checkout");
  checkoutView.hidden = true;
  cartView.hidden = false;
  document.querySelector("#cart-title").textContent = "Tu carrito";
  checkoutStep = "shipping";
});

const shippingRules = {
  email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/u, message: "Escribe un correo electrónico válido." },
  nombre: { pattern: /^[\p{L}\p{M}][\p{L}\p{M}'’ -]{1,79}$/u, message: "Escribe un nombre de al menos 2 letras." },
  apellidos: { pattern: /^[\p{L}\p{M}][\p{L}\p{M}'’ -]{1,99}$/u, message: "Escribe tus apellidos (al menos 2 letras)." },
  telefono: { pattern: /^\+?[0-9][0-9().\s-]{6,18}$/u, message: "Escribe un teléfono válido con al menos 7 dígitos." },
  provincia: { pattern: /^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,59}$/u, message: "Escribe el nombre de la provincia." },
  ciudad: { pattern: /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'’-]{1,79}$/u, message: "Escribe el nombre de la ciudad." },
  codigoPostal: { pattern: /^[\p{L}\p{N} -]{3,12}$/u, message: "Escribe un código postal válido o deja este campo vacío." },
  calle: { pattern: /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} .,'’#/-]{2,119}$/u, message: "Escribe una calle y número (al menos 3 caracteres)." },
  referencia: { pattern: /^[\p{L}\p{M}\p{N} .,'’#/-]{0,120}$/u, message: "La referencia debe tener hasta 120 caracteres." },
};

function validateCheckoutField(field, rules = shippingRules) {
  const rule = rules[field.name];
  if (!rule) return true;
  const value = field.value.trim();
  const optionalEmpty = !field.required && value === "";
  const phoneDigitCount = field.name === "telefono" ? (value.match(/\d/g) || []).length : 0;
  const valid = optionalEmpty || (
    rule.pattern.test(value) &&
    (field.name !== "telefono" || phoneDigitCount >= 7)
  );
  const error = document.querySelector(`#${field.id}-error`);
  field.setAttribute("aria-invalid", String(!valid));
  if (error) error.textContent = valid ? "" : rule.message;
  if (!valid) field.setAttribute("aria-describedby", `${field.id}-error`);
  return valid;
}

document.querySelector("#checkout-open").addEventListener("click", () => {
  if (!cartItems.size) {
    announceCart("Agrega al menos un producto antes de continuar.");
    return;
  }
  document.querySelector("#shipping-error").hidden = true;
  document.querySelector("#shipping-form").reset();
  shippingDetails = null;
  showCheckoutStep("shipping");
});

document.querySelector("#checkout-back").addEventListener("click", (event) => {
  event.preventDefault();
  checkoutView.hidden = true;
  cartView.hidden = false;
  document.querySelector("#cart-title").textContent = "Tu carrito";
  document.querySelector("#checkout-open").focus();
});

document.querySelector("#shipping-form").addEventListener("input", (event) => {
  if (event.target.matches("input[name]")) {
    validateCheckoutField(event.target);
    document.querySelector("#shipping-error").hidden = true;
  }
});

document.querySelector("#shipping-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const fields = [...event.currentTarget.querySelectorAll("input[name]")];
  const invalid = fields.filter((field) => !validateCheckoutField(field));
  if (invalid.length) {
    const error = document.querySelector("#shipping-error");
    error.textContent = "Completa o corrige los campos marcados antes de continuar.";
    error.hidden = false;
    invalid[0].focus();
    return;
  }
  shippingDetails = Object.fromEntries(new FormData(event.currentTarget).entries());
  showCheckoutStep("payment");
});

document.querySelector("#payment-back").addEventListener("click", () => showCheckoutStep("shipping"));
document.querySelector("#payment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!shippingDetails) {
    showCheckoutStep("shipping");
    return;
  }
  showCheckoutStep("confirmation");
});

document.querySelector("#review-back").addEventListener("click", () => showCheckoutStep("payment"));
document.querySelector("#review-edit-address").addEventListener("click", (event) => {
  event.preventDefault();
  showCheckoutStep("shipping");
});
document.querySelector("#checkout-edit-cart").addEventListener("click", (event) => {
  event.preventDefault();
  checkoutView.hidden = true;
  cartView.hidden = false;
  document.querySelector("#cart-title").textContent = "Tu carrito";
  document.querySelector("#checkout-open").focus();
});
document.querySelector("#checkout-whatsapp").addEventListener("click", () => {
  document.querySelector("#checkout-status").textContent =
    "WhatsApp se abrió con una cotización no vinculante. No se ha procesado ningún pago ni confirmado un pedido.";
});

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
  if (!Number.isInteger(nextQuantity) || nextQuantity < 1 || nextQuantity > 99) {
    announceCart("La cantidad debe ser un número entero entre 1 y 99.");
    renderCart();
    return;
  }
  cartItems.set(productId, nextQuantity);
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
document.querySelector("#cart-quote").addEventListener("click", (event) => {
  if (cartItems.size === 0) {
    event.preventDefault();
    announceCart("Agrega al menos un producto antes de preparar una cotizacion.");
  }
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
  const isOptionalEmpty = ["telefono", "empresa"].includes(field.name) && value === "";
  const phoneDigitCount = field.name === "telefono" ? (value.match(/\d/g) || []).length : 0;
  const isValid = isOptionalEmpty || (
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
    const formData = new FormData(contactForm);
    const message = [
      "Hola, quisiera consultar el catalogo Dermaclar.",
      `Nombre: ${formData.get("nombre")}`,
      `Negocio: ${formData.get("empresa") || "No indicado"}`,
      `Correo: ${formData.get("correo")}`,
      `Telefono: ${formData.get("telefono") || "No indicado"}`,
      `Producto de interes: ${formData.get("producto")}`,
      `Consulta: ${formData.get("mensaje") || "Sin mensaje adicional"}`,
      "Por favor, confirmame disponibilidad y condiciones vigentes.",
    ].join("\n");
    const whatsappUrl = `https://wa.me/593996096996?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    contactStatus.textContent = "Se preparó tu consulta. Revisa el mensaje en WhatsApp antes de enviarlo; si no se abrió, utiliza el enlace de WhatsApp.";
  });
}

readCart();
renderCart();
loadCatalog();