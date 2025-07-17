export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Anonim Oylama. Tüm hakları saklıdır.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
              Gizlilik Politikası
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
              Kullanım Koşulları
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
              İletişim
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 