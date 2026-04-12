# 构建并推送 Docker 镜像到阿里云镜像仓库
# 用法：.\build-and-push.ps1

$ErrorActionPreference = "Stop"

# 从 package.json 读取版本号
$version     = (Get-Content -Raw package.json | ConvertFrom-Json).version
$registry    = "registry.cn-shenzhen.aliyuncs.com"
$imageBase   = "$registry/sakkacloud/orixa-dashboard"
$imageTag    = "${imageBase}:$version"
$imageLatest = "${imageBase}:latest"
$domain      = "dashboard.orixa.sakka.cn"
$sslDir      = "ssl"

Write-Host "版本号: $version"
Write-Host "镜像:   $imageTag"
Write-Host "        $imageLatest"
Write-Host ""

# 生成自签名证书（如已存在则跳过）
if (-not (Test-Path "$sslDir/tls.crt") -or -not (Test-Path "$sslDir/tls.key")) {
    Write-Host ">>> 生成自签名证书 (域名: $domain)..."
    New-Item -ItemType Directory -Force -Path $sslDir | Out-Null

    docker run --rm `
        -v "${PWD}/${sslDir}:/ssl" `
        alpine/openssl req -x509 -nodes -newkey rsa:2048 -days 3650 `
            -keyout /ssl/tls.key `
            -out    /ssl/tls.crt `
            -subj   "/CN=$domain/O=Sakka/C=CN" `
            -addext "subjectAltName=DNS:$domain"

    if ($LASTEXITCODE -ne 0) { Write-Error "证书生成失败"; exit 1 }
    Write-Host ">>> 证书已生成: $sslDir/tls.crt, $sslDir/tls.key"
    Write-Host ""
} else {
    Write-Host ">>> 证书已存在，跳过生成"
    Write-Host ""
}

# 备份当前 .env，使用 .env.aliyun 构建
$envBackup = $null
if (Test-Path ".env") {
    $envBackup = Get-Content -Raw ".env"
}
Copy-Item ".env.aliyun" ".env" -Force
Write-Host ">>> 使用 .env.aliyun 作为构建配置"

try {
    # 本地执行 yarn build
    Write-Host ">>> 本地构建前端资源 (yarn build)..."
    yarn build
    if ($LASTEXITCODE -ne 0) { throw "yarn build 失败" }
    Write-Host ">>> yarn build 完成"
    Write-Host ""
} finally {
    # 无论成功失败都还原 .env
    if ($null -ne $envBackup) {
        [System.IO.File]::WriteAllText((Join-Path (Get-Location) ".env"), $envBackup, [System.Text.Encoding]::UTF8)
        Write-Host ">>> 已还原 .env"
    } else {
        Remove-Item ".env" -ErrorAction SilentlyContinue
    }
    Write-Host ""
}

# 构建镜像（只构建一次，打版本号 tag）
Write-Host ">>> 开始构建镜像..."
docker build -t $imageTag .
if ($LASTEXITCODE -ne 0) { Write-Error "镜像构建失败"; exit 1 }

# 打 latest tag（复用同一层，无需重新构建）
docker tag $imageTag $imageLatest
if ($LASTEXITCODE -ne 0) { Write-Error "打 latest tag 失败"; exit 1 }
Write-Host ">>> 构建完成"
Write-Host ""

# 推送两个 tag
Write-Host ">>> 推送 $imageTag ..."
docker push $imageTag
if ($LASTEXITCODE -ne 0) { Write-Error "推送版本镜像失败"; exit 1 }

Write-Host ">>> 推送 $imageLatest ..."
docker push $imageLatest
if ($LASTEXITCODE -ne 0) { Write-Error "推送 latest 镜像失败"; exit 1 }

Write-Host ">>> 推送完成"
Write-Host ""
Write-Host "镜像已成功发布:"
Write-Host "  $imageTag"
Write-Host "  $imageLatest"