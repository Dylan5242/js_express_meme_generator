const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Загрузка подписей (если файла нет — будет ошибка при старте)
const memesData = require("./data/memesData.json");

// Получаем список файлов, содержащих "meme" и с расширением jpg/jpeg
function getMemeImages() {
    const imagesDir = path.join(__dirname, "assets", "images");
    try {
        const files = fs.readdirSync(imagesDir);
        return files
            .filter(f => /meme.*\.jpe?g$/i.test(f))
            .sort((a, b) => {
                const na = (a.match(/\d+/) || ["0"])[0];
                const nb = (b.match(/\d+/) || ["0"])[0];
                return Number(na) - Number(nb);
            });
    } catch (err) {
        console.error("Ошибка чтения каталога изображений:", err.message);
        return [];
    }
}

// Возвращает случайный мем
app.get("/api/meme", (req, res) => {
    const images = getMemeImages();
    if (images.length === 0) {
        return res.status(404).json({ success: false, error: "No meme images found" });
    }

    const randImg = images[Math.floor(Math.random() * images.length)];
    const captions = Array.isArray(memesData.captions) ? memesData.captions : [];
    const caption = captions.length ? captions[Math.floor(Math.random() * captions.length)] : "";

    res.json({
        success: true,
        imageUrl: `/assets/images/${randImg}`,
        caption,
        info: {
            totalImages: images.length,
            totalCaptions: captions.length,
            currentImage: randImg.replace(/\.(jpe?g)$/i, "")
        }
    });
});

// Информация о доступных мемах
app.get("/api/info", (req, res) => {
    const images = getMemeImages();
    const captions = Array.isArray(memesData.captions) ? memesData.captions : [];
    res.json({
        success: true,
        images: images.map(n => ({ name: n, url: `/assets/images/${n}` })),
        totalImages: images.length,
        totalCaptions: captions.length,
        sampleCaptions: captions.slice(0, 5)
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
    const imgs = getMemeImages();
    console.log(`Found ${imgs.length} meme images:`);
    imgs.forEach(i => console.log(" -", i));
});
