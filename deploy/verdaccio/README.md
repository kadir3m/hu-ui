# Verdaccio kurulumu

Bu klasörde kurum içi npm registry'si için gereken dosyalar var. Örneklerdeki
`npm.example.com` adresini kendi alan adınızla değiştirin. Aynı adres `docker-compose.yml` ve
`nginx.conf.example` dosyalarında da geçiyor. Paketi bu registry'ye yayınlayacaksanız
`projects/hu-ui/package.json` içindeki `publishConfig.registry` alanını da bu adres yapın.

## 1. Sunucuyu başlatın

```bash
cd deploy/verdaccio
touch htpasswd
docker compose up -d
```

## 2. Kullanıcıları ekleyin

`max_users: -1` ayarı yüzünden dışarıdan kayıt kapalı. Hesapları yönetici açar:

```bash
# htpasswd aracı: apache2-utils (Debian/Ubuntu) veya httpd-tools (RHEL)
htpasswd -B htpasswd yayinci        # paket yayınlayacak hesap
htpasswd -B htpasswd gelistirici1   # yalnızca paket indirecek hesap
```

Yayın yetkisi `config.yaml` içindeki `hu-publisher` grubundadır. htpasswd'de grup kavramı
olmadığından en basit yöntem, `publish:` satırını doğrudan kullanıcı adlarıyla yazmaktır:

```yaml
'@ucme-ui/*':
  access: $authenticated
  publish: yayinci
```

Değişiklikten sonra: `docker compose restart verdaccio`

## 3. HTTPS

`nginx.conf.example` dosyasını nginx'e ekleyin. npm, token'ları her istekte gönderdiği için
kurum ağı içinde de HTTP kullanmayın.

## 4. Yedekleme

Yayınlanan tüm paketler `verdaccio-storage` volume'unda durur. Bu volume'u düzenli olarak yedekleyin.
