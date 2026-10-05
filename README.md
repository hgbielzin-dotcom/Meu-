# Floricultura Jardins

Landing page da **Floricultura Jardins**, uma floricultura fictícia, com foco na campanha de **Dia das Mães**.
Projeto desenvolvido para atividade acadêmica.

## Como abrir

Não precisa instalar nada. Basta abrir o arquivo `index.html` no navegador.

Para testar como um site de verdade, com os links internos e o mapa funcionando, rode um servidor local na pasta do projeto:

```bash
npx http-server .        # ou: python3 -m http.server
```

Depois acesse `http://localhost:8080` (ou `http://localhost:8000`, no caso do Python).

### Publicar no GitHub Pages

Em **Settings → Pages**, escolha a branch e a pasta `/ (root)`. O site fica disponível em `https://<usuario>.github.io/<repositorio>/`.

## Estrutura

```
index.html          → todas as seções da página
css/style.css       → identidade visual, layout, responsividade e animações
js/main.js          → menu, animações ao rolar, carrossel, modal, galeria e formulário
assets/favicon.png  → ícone da aba do navegador (flores do logotipo)
assets/img/         → logotipo (logo-jardins), emblema de flores e fotos do buquê, box, planta e cesta
assets/fonts/       → Playfair Display e Montserrat (licença OFL), funcionam offline
```

## Vídeo do plano de Dia das Mães

A pasta `video/` tem o vídeo de apresentação dos cronogramas, da logística e da montagem do stand (2min15s, Full HD, sem áudio):

```
video/apresentacao.html → as 10 cenas animadas (abra no navegador para ver em loop)
video/gravar.js         → grava as cenas em MP4, quadro a quadro
video/roteiro.md        → texto sugerido para narrar cada cena, com os tempos
```

Para gerar o MP4 de novo (precisa de Node, Playwright e ffmpeg):

```bash
npx http-server -p 8080 .
node video/gravar.js
```

## Seções

Início → Coleções → Produtos → Dia das Mães → Nossa história → Missão, visão e valores → Princípios → Diferenciais → Depoimentos → Galeria → Loja → Contato → Redes sociais → Chamada final → Rodapé.

## Identidade visual

| Cor | Hex | Uso |
| --- | --- | --- |
| Rosa suave | `#E8A6B5` | detalhes, ícones, estrelas |
| Rosa claro | `#F8DDE4` | fundos da campanha e selos |
| Verde sálvia | `#8FA98C` | folhas, ícones e linhas |
| Verde escuro | `#435B46` | botões, faixa de princípios |
| Creme | `#FFF8F2` | fundo principal |
| Branco | `#FFFFFF` | cards e seções claras |
| Texto escuro | `#2F3630` | textos e rodapé |

As cores ficam como variáveis no início de `css/style.css` (`--rosa`, `--verde` etc.). Para mudar a paleta, basta alterar esses valores.

Títulos em **Playfair Display** e textos em **Montserrat**.

## Animações e interações

- Título do topo surgindo palavra por palavra e imagem entrando pela lateral.
- Elementos aparecendo conforme a rolagem (fade-up, fade-in, slide lateral e entrada em sequência).
- Parallax leve nas fotos (somente em telas grandes).
- Header transparente que ganha fundo branco e sombra ao rolar, e link ativo conforme a seção.
- Hover nos cards (foto com zoom e card subindo) e nos botões (brilho, leve aumento e seta deslizando).
- Faixa verde com bordas curvas e transições suaves de fundo entre as seções.
- Modal “Ver detalhes” para cada produto, com link de pedido pelo WhatsApp.
- Carrossel de depoimentos (automático, com setas, pontos e gesto de deslizar).
- Galeria com ampliação da imagem (lightbox).
- Indicador “Aberto agora / Fechado agora” calculado pelo horário de São Paulo.
- Formulário com validação e máscara de telefone.
- Menu hambúrguer no celular.
- Quem ativa “reduzir movimento” no sistema vê a página sem animações.

## Trocando informações fictícias

| O quê | Onde |
| --- | --- |
| WhatsApp `(11) 99999-9999` | procure por `5511999999999` em `index.html` e `js/main.js` |
| Telefone, e-mail e endereço | seções **Loja**, **Contato** e rodapé em `index.html` |
| Mapa | `iframe` da seção **Loja**: troque o endereço no `src` |
| Produtos e preços | cards em `index.html` e textos do modal no objeto `produtos` em `js/main.js` |
| Redes sociais | links `instagram.com`, `facebook.com` e `tiktok.com` em `index.html` |

> O formulário de contato é uma demonstração: ele valida os campos e mostra a confirmação, mas não envia a mensagem para lugar nenhum. Para receber as mensagens de verdade, conecte o formulário a um serviço como Formspree ou EmailJS (veja o comentário no fim de `js/main.js`).

## Fotos

### Fotos do projeto (`assets/img/`)

São as fotos enviadas para o site (buquê, box de flores, planta e cesta de presente) e recortes delas. Ficam dentro do projeto, então aparecem sempre, mesmo sem internet.

| Arquivo | Onde aparece |
| --- | --- |
| `assets/img/buque.jpg` | Início, Instagram |
| `assets/img/box-flores-detalhe.jpg` | Início, Dia das Mães |
| `assets/img/buque-colecao.jpg` | Coleções |
| `assets/img/box-flores.jpg` | Coleções, Instagram |
| `assets/img/planta.jpg` | Coleções, Instagram |
| `assets/img/cesta-presente.jpg` | Coleções, Instagram |
| `assets/img/cesta-detalhe.jpg` | Dia das Mães |
| `assets/img/planta-detalhe.jpg` | Instagram |
| `assets/img/buque-laco.jpg` | Instagram |
| `assets/img/buque-faixa.jpg` | Chamada final |

### Fotos do Unsplash

As demais fotos são do [Unsplash](https://unsplash.com) (licença gratuita do Unsplash) e carregam direto de lá, então **é preciso estar conectado à internet** para vê-las. Enquanto carregam, ou se alguma não carregar, o espaço fica com um fundo liso em tons de rosa e creme.

Para trocar qualquer uma por uma foto sua, salve o arquivo em `assets/img/` e mude o `src` da imagem em `index.html`:

```html
<img src="assets/img/minha-foto.jpg" alt="Descrição da foto" ...>
```

| Seção | Foto | Unsplash |
| --- | --- | --- |
| Produtos | Buquê de rosas em tons delicados de bege e rosa | [lwlbLowPcHE](https://unsplash.com/photos/lwlbLowPcHE) |
| Produtos | Tulipas coloridas arranjadas em um vaso de vidro | [ZxSNWVS4HWE](https://unsplash.com/photos/ZxSNWVS4HWE) |
| Produtos | Buquê de flores variadas embrulhado em papel kraft | [zrmCrWCbHPA](https://unsplash.com/photos/zrmCrWCbHPA) |
| Produtos | Caixa de presente com flores frescas arranjadas dentro | [Yix2ME5y_d4](https://unsplash.com/photos/Yix2ME5y_d4) |
| Produtos | Pessoa segurando um buquê clássico de rosas vermelhas | [qJy61YwqQB8](https://unsplash.com/photos/qJy61YwqQB8) |
| Produtos | Peônias cor-de-rosa em um vaso sobre superfície rosa | [Grtj6vZttDA](https://unsplash.com/photos/Grtj6vZttDA) |
| Dia das Mães | Mulher sorrindo ao receber um buquê de rosas | [EQ1MR3mKg9w](https://unsplash.com/photos/EQ1MR3mKg9w) |
| Nossa história | Florista preparando um arranjo de flores dentro da loja | [3DyfEiITFz4](https://unsplash.com/photos/3DyfEiITFz4) |
| Nossa história | Mãos amarrando um buquê com barbante e tesoura sobre a bancada | [cb7N6IIC5QA](https://unsplash.com/photos/cb7N6IIC5QA) |
| Mais do que flores | Florista de avental criando um arranjo de flores no ateliê | [Ir4w5n4GSqo](https://unsplash.com/photos/Ir4w5n4GSqo) |
| Depoimentos | Mulher sorrindo segurando um buquê de flores cor-de-rosa | [bkVIOmdyvwM](https://unsplash.com/photos/bkVIOmdyvwM) |
| Galeria | Buquê de rosas cor-de-rosa e vermelhas | [G4n3JPUNQgg](https://unsplash.com/photos/G4n3JPUNQgg) |
| Galeria | Pétalas de rosas cor-de-rosa vistas de perto | [XAzSSjwcwN4](https://unsplash.com/photos/XAzSSjwcwN4) |
| Galeria | Mãos arranjando hortênsias cor-de-rosa e galhos verdes | [kDeW2wMjiY8](https://unsplash.com/photos/kDeW2wMjiY8) |
| Galeria | Rosas cor-de-rosa e brancas em detalhe | [jjj1rHyYyG0](https://unsplash.com/photos/jjj1rHyYyG0) |
| Galeria | Buquê de tulipas embrulhado em papel kraft | [vr8kXY3KWM8](https://unsplash.com/photos/vr8kXY3KWM8) |
| Galeria | Flores coloridas organizadas em baldes na loja | [1yqxcV0ONvE](https://unsplash.com/photos/1yqxcV0ONvE) |
| Galeria | Tulipas cor-de-rosa, brancas e vermelhas | [43m51FRyG88](https://unsplash.com/photos/43m51FRyG88) |
| Galeria | Tulipas coloridas em vaso de vidro na janela | [l-6cbjLd2N4](https://unsplash.com/photos/l-6cbjLd2N4) |
| Loja | Fachada charmosa da floricultura com plantas e guirlandas na entrada | [Izb_LX0E5yw](https://unsplash.com/photos/Izb_LX0E5yw) |

Ícones: [Lucide](https://lucide.dev) (ISC) e [Font Awesome Free](https://fontawesome.com) (CC BY 4.0) para as marcas das redes sociais.
