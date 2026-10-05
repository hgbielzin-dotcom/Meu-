/*
 * Grava video/apresentacao.html como MP4 (1920×1080, 30 fps).
 * Cada quadro é desenhado em um tempo exato (renderAt), então o vídeo sai sem travadas.
 *
 * Se existir video/narracao.wav (gerado por narracao.py), a narração entra como áudio,
 * com equalização leve e volume nivelado. Sem ela, o vídeo sai com trilha silenciosa.
 *
 * Uso (na pasta do projeto, com um servidor local rodando):
 *   python3 video/narracao.py
 *   npx http-server -p 8080 .
 *   node video/gravar.js [url] [saida.mp4]
 * Requer Playwright (Chromium) e ffmpeg instalados.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const URL_VIDEO = process.argv[2] || 'http://127.0.0.1:8080/video/apresentacao.html?render';
const SAIDA = process.argv[3] || 'floricultura-jardins-dia-das-maes.mp4';
const FPS = 30;

(async () => {
  const navegador = await chromium.launch();
  const pagina = await navegador.newPage({ viewport: { width: 1920, height: 1080 } });
  await pagina.goto(URL_VIDEO);
  const total = await pagina.evaluate(() => window.pronto);
  const quadros = Math.ceil(total * FPS);
  console.log(`Duração: ${total.toFixed(1)} s · ${quadros} quadros`);

  const narracao = path.join(__dirname, 'narracao.wav');
  const audio = fs.existsSync(narracao)
    ? ['-i', narracao, '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=5:release=90,loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-ac', '2']
    : ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo'];
  console.log(fs.existsSync(narracao) ? 'Com narração' : 'Sem narração (trilha silenciosa)');

  const ffmpeg = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    ...audio,
    '-map', '0:v', '-map', '1:a', '-t', total.toFixed(3),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', SAIDA,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let i = 0; i < quadros; i++) {
    await pagina.evaluate((t) => window.renderAt(t), i / FPS);
    const quadro = await pagina.screenshot({ type: 'jpeg', quality: 95 });
    if (!ffmpeg.stdin.write(quadro)) await new Promise((r) => ffmpeg.stdin.once('drain', r));
    if (i % 300 === 0) console.log(`${i}/${quadros}`);
  }
  ffmpeg.stdin.end();
  await new Promise((r) => ffmpeg.on('close', r));
  await navegador.close();
  console.log(`Pronto: ${SAIDA}`);
})().catch((erro) => { console.error(erro); process.exit(1); });
