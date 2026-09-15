param(
    [string]$Path = 'hola mundo',
    [string]$Output = 'AUDITORIA-UX-ACCESIBILIDAD.md'
)

$ErrorActionPreference = 'Stop'
$repo = $PSScriptRoot
$nodeFolder = Get-ChildItem "$repo\.tools\node" -Directory -Filter 'node-v*-win-x64' | Select-Object -First 1
$openCode = "$repo\.tools\opencode\opencode.cmd"

if (-not $nodeFolder -or -not (Test-Path $openCode)) {
    throw 'OpenCode no esta instalado en .tools.'
}

$target = Join-Path $repo $Path
if (-not (Test-Path $target -PathType Container)) {
    throw "No existe la carpeta a auditar: $Path"
}

$outputPath = if ([System.IO.Path]::IsPathRooted($Output)) {
    $Output
} else {
    Join-Path $repo $Output
}
$outputParent = Split-Path -Parent $outputPath
New-Item -ItemType Directory -Force -Path $outputParent | Out-Null

Push-Location $repo
try {
    $utf8 = [System.Text.UTF8Encoding]::new($false)
    [Console]::OutputEncoding = $utf8
    $OutputEncoding = $utf8
    $env:PATH = "$($nodeFolder.FullName);$($nodeFolder.FullName)\node_modules\npm\bin;$env:PATH"
    $prompt = @"
Audita UX y accesibilidad de la carpeta '$Path'.
Genera un informe completo en Markdown en espanol siguiendo tus instrucciones.
Incluye evidencia concreta de los archivos inspeccionados y separa hallazgos confirmados de recomendaciones.
No modifiques ningun archivo.
"@
    & $openCode run --agent auditor --model opencode/mimo-v2.5-free $prompt | Out-File -FilePath $outputPath -Encoding utf8
    if ($LASTEXITCODE -ne 0) {
        throw "El auditor termino con codigo $LASTEXITCODE."
    }
    Write-Host "Informe generado: $Output"
    Write-Host 'Modelo: opencode/mimo-v2.5-free (gratuito segun disponibilidad del proveedor)'
}
finally {
    Pop-Location
}
