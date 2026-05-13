import sharp from "sharp";

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#7c3aed"/>
  <text y="70" x="50" text-anchor="middle" font-size="60">🃏</text>
</svg>`);

await sharp(svg).resize(192, 192).png().toFile("public/pwa-192x192.png");
await sharp(svg).resize(512, 512).png().toFile("public/pwa-512x512.png");
console.log("Ícones gerados com sucesso!");
