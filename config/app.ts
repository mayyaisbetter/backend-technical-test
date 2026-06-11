import proxyAddr from 'proxy-addr'
import Env from '@ioc:Adonis/Core/Env'
import type { ServerConfig } from '@ioc:Adonis/Core/Server'
import type { LoggerConfig } from '@ioc:Adonis/Core/Logger'
import type { ProfilerConfig } from '@ioc:Adonis/Core/Profiler'
import type { ValidatorConfig } from '@ioc:Adonis/Core/Validator'

// Kunci rahasia aplikasi untuk enkripsi data (diambil dari .env)
export const appKey: string = Env.get('APP_KEY')

// Konfigurasi server HTTP
export const http: ServerConfig = {
  // Menonaktifkan manipulasi HTTP method (seperti PUT/DELETE via form)
  allowMethodSpoofing: false,

  // Penentuan offset untuk membaca subdomain
  subdomainOffset: 2,

  // Menonaktifkan pembuatan ID unik otomatis untuk setiap HTTP request
  generateRequestId: false,

  // Mengatur server proxy mana yang dipercaya oleh aplikasi
  trustProxy: proxyAddr.compile('loopback'),

  // Menonaktifkan pembuatan Etag untuk cache HTTP
  etag: false,

  // Nama parameter callback untuk format JSONP
  jsonpCallbackName: 'callback',

  // Pengaturan default untuk cookie aplikasi
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: false,
    sameSite: false,
  },

  // Memaksa server untuk selalu membalas request dalam format JSON (cocok untuk API)
  forceContentNegotiationTo: 'application/json',
}

// Konfigurasi sistem pencatatan (logger)
export const logger: LoggerConfig = {
  // Nama aplikasi yang akan muncul di setiap baris log
  name: Env.get('APP_NAME', 'leave-management-api'),

  // Mengaktifkan fitur logger
  enabled: true,

  // Tingkat minimum log yang dicatat (contoh: info, debug, warn, error)
  level: Env.get('LOG_LEVEL', 'info'),

  // Mempercantik format log agar mudah dibaca khusus saat mode development
  prettyPrint: Env.get('NODE_ENV') === 'development',
}

// Konfigurasi profiler untuk memantau performa aplikasi (waktu proses, dll)
export const profiler: ProfilerConfig = {
  // Mengaktifkan fitur profiler
  enabled: true,

  // Daftar aksi/label yang TIDAK ingin dipantau oleh profiler
  blacklist: [],

  // Daftar aksi/label spesifik yang HANYA akan dipantau (blacklist akan diabaikan jika ini diisi)
  whitelist: [],
}

// Konfigurasi global untuk validasi data/input
export const validator: ValidatorConfig = {
}
