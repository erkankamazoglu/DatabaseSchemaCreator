# Veritabanı Şema Tasarım Aracı

Modern bir web tabanlı veritabanı şema tasarım aracı. Tablolar oluşturun, kolonlar ekleyin, ilişkiler kurun ve şemanızı JSON olarak export edin.

## Özellikler

- ✅ **Görsel Tablo Tasarımı**: Drag & drop ile tablolarınızı istediğiniz yere yerleştirin
- ✅ **Kolon Yönetimi**: Farklı veri tipleri ile kolonlar oluşturun
- ✅ **İlişki Kurma**: Tablolar arası 1:1, 1:N, N:M ilişkileri görsel olarak tanımlayın
- ✅ **JSON Export/Import**: Şemanızı JSON formatında kaydedin ve yükleyin
- ✅ **Modern Arayüz**: Kullanıcı dostu ve responsive tasarım

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npx vite
```

3. Tarayıcınızda `http://localhost:3000` adresini açın.

## Kullanım

### Tablo Oluşturma
1. Sol panelde "Yeni Tablo" alanına tablo adını yazın
2. "+" butonuna tıklayın
3. Tablo canvas üzerinde rastgele bir konumda belirecek

### Kolon Ekleme
1. Listeden bir tablo seçin
2. "Kolonlar" bölümündeki "+" butonuna tıklayın
3. Kolon adı, veri tipi ve özelliklerini girin
4. "Ekle" butonuna tıklayın

### İlişki Kurma
1. En az 2 tablo oluşturun
2. "İlişkiler" bölümündeki "+" butonuna tıklayın
3. Kaynak ve hedef tablo/kolonları seçin
4. İlişki tipini belirleyin (1:1, 1:N, N:M)
5. "Ekle" butonuna tıklayın

### Export/Import
- **Export**: "JSON Olarak İndir" butonuna tıklayarak şemanızı bilgisayarınıza kaydedin
- **Import**: "JSON Yükle" butonuna tıklayarak daha önce kaydedilmiş bir şemayı yükleyin

## Desteklenen Veri Tipleri

- VARCHAR
- INT
- BIGINT
- DECIMAL
- FLOAT
- DOUBLE
- BOOLEAN
- DATE
- DATETIME
- TIMESTAMP
- TEXT
- BLOB

## Teknolojiler

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **React Draggable** - Drag & Drop
- **Lucide React** - Icons

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
