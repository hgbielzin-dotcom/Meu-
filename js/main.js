/* ==========================================================================
   Floricultura Jardins — interações
   ========================================================================== */
(() => {
  'use strict';

  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const telaLarga = window.matchMedia('(min-width: 900px)');
  const WHATSAPP = '5511999999999';

  /* ---------- Imagens: aparecem suavemente ao carregar ---------- */
  document.addEventListener('load', (e) => {
    if (e.target.tagName === 'IMG') {
      e.target.classList.remove('is-error');
      e.target.classList.add('is-loaded');
    }
  }, true);
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') e.target.classList.add('is-error');
  }, true);
  $$('.media img').forEach((img) => {
    if (img.complete && img.naturalWidth) img.classList.add('is-loaded');
  });

  /* ---------- Trava de rolagem (menu e modais) ---------- */
  const travas = new Set();
  function travarRolagem(chave, travar) {
    if (travar) travas.add(chave); else travas.delete(chave);
    document.body.classList.toggle('travado', travas.size > 0);
  }

  /* ---------- Header, botão flutuante e parallax ---------- */
  const header = $('#header');
  const whatsFlutuante = $('.whats-flutuante');
  const elementosParallax = $$('[data-parallax], [data-parallax-img]');
  let agendado = false;

  function atualizarParallax() {
    const ativo = telaLarga.matches && !movimentoReduzido.matches;
    const alturaTela = window.innerHeight;

    elementosParallax.forEach((el) => {
      if (!ativo) {
        el.style.removeProperty('--py');
        return;
      }
      const ehImagem = el.hasAttribute('data-parallax-img');
      // a imagem se move dentro da moldura; usamos a moldura como referência
      const referencia = ehImagem ? el.parentElement : el;
      const caixa = referencia.getBoundingClientRect();
      if (caixa.bottom < -200 || caixa.top > alturaTela + 200) return;

      const deslocAtual = ehImagem ? 0 : parseFloat(el.dataset.py || 0);
      const centro = caixa.top - deslocAtual + caixa.height / 2 - alturaTela / 2;
      const velocidade = parseFloat(ehImagem ? el.dataset.parallaxImg : el.dataset.parallax);
      let y = -centro * velocidade;
      if (ehImagem) {
        const limite = caixa.height * 0.08;
        y = Math.max(-limite, Math.min(limite, y));
      }
      el.dataset.py = y.toFixed(1);
      el.style.setProperty('--py', `${y.toFixed(1)}px`);
    });
  }

  function aoRolar() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    whatsFlutuante.classList.toggle('is-visivel', y > window.innerHeight * 0.7);
    atualizarParallax();
    agendado = false;
  }

  function agendar() {
    if (!agendado) {
      agendado = true;
      requestAnimationFrame(aoRolar);
    }
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar);
  aoRolar();

  /* ---------- Menu mobile ---------- */
  const menu = $('#menu-mobile');
  const botaoMenu = $('.menu-toggle');
  const botaoFechar = $('.menu-close', menu);
  const focaveisMenu = $$('a, button', menu);

  function abrirMenu(abrir, { devolverFoco = true } = {}) {
    menu.classList.toggle('is-open', abrir);
    menu.setAttribute('aria-hidden', String(!abrir));
    menu.inert = !abrir;
    botaoMenu.setAttribute('aria-expanded', String(abrir));
    botaoMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    focaveisMenu.forEach((el) => { el.tabIndex = abrir ? 0 : -1; });
    travarRolagem('menu', abrir);
    if (abrir) botaoFechar.focus();
    else if (devolverFoco) botaoMenu.focus({ preventScroll: true });
  }

  menu.inert = true;
  botaoMenu.addEventListener('click', () => abrirMenu(true));
  botaoFechar.addEventListener('click', () => abrirMenu(false));
  $$('a[href^="#"]', menu).forEach((link) => {
    link.addEventListener('click', () => abrirMenu(false, { devolverFoco: false }));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) abrirMenu(false);
  });
  telaLarga.addEventListener('change', () => {
    if (window.innerWidth > 1080 && menu.classList.contains('is-open')) abrirMenu(false, { devolverFoco: false });
  });

  /* ---------- Link ativo no menu conforme a seção visível ---------- */
  const linksNav = $$('.nav__link');
  const linkPorSecao = new Map(linksNav.map((link) => [link.getAttribute('href').slice(1), link]));

  if ('IntersectionObserver' in window) {
    const observadorSecoes = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        const ativo = linkPorSecao.get(entrada.target.id);
        linksNav.forEach((link) => link.classList.toggle('is-active', link === ativo));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section').forEach((secao) => observadorSecoes.observe(secao));
  }

  /* ---------- Animações de entrada ao rolar ---------- */
  $$('[data-stagger]').forEach((grupo) => {
    [...grupo.children].forEach((filho, i) => {
      if (!filho.style.getPropertyValue('--d')) {
        filho.style.setProperty('--d', `${(Math.min(i, 6) * 0.1).toFixed(2)}s`);
      }
    });
  });

  const revelaveis = $$('[data-reveal], [data-stagger] > *, .ornamento');

  function revelar(el) {
    el.classList.add('is-visible');
    const contadores = el.matches('[data-count]') ? [el] : $$('[data-count]', el);
    contadores.forEach(contar);
  }

  if (!('IntersectionObserver' in window)) {
    revelaveis.forEach(revelar);
  } else {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        revelar(entrada.target);
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revelaveis.forEach((el) => observador.observe(el));
  }

  /* ---------- Contadores (números da história) ---------- */
  function contar(el) {
    const alvo = parseFloat(el.dataset.count);
    const casas = Number(el.dataset.decimals || 0);
    const formatar = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    if (movimentoReduzido.matches) {
      el.textContent = formatar(alvo);
      return;
    }
    const duracao = 1800;
    const inicio = performance.now();
    const passo = (agora) => {
      const p = Math.min((agora - inicio) / duracao, 1);
      const suave = 1 - Math.pow(1 - p, 3);
      el.textContent = formatar(alvo * suave);
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  /* ---------- Diálogos (modal de produto e lightbox) ---------- */
  function abrirDialogo(dialogo) {
    if (typeof dialogo.showModal === 'function') dialogo.showModal();
    else dialogo.setAttribute('open', '');
    travarRolagem(dialogo.id, true);
  }

  function fecharDialogo(dialogo) {
    if (typeof dialogo.close === 'function') dialogo.close();
    else dialogo.removeAttribute('open');
  }

  $$('dialog').forEach((dialogo) => {
    dialogo.addEventListener('close', () => travarRolagem(dialogo.id, false));
    // clique fora da caixa (no fundo escurecido) fecha
    dialogo.addEventListener('click', (e) => {
      if (e.target === dialogo) fecharDialogo(dialogo);
    });
    $$('[data-fechar]', dialogo).forEach((botao) => {
      botao.addEventListener('click', () => fecharDialogo(dialogo));
    });
  });

  /* ---------- Produtos ---------- */
  const produtos = {
    'amor-de-mae': {
      nome: 'Buquê Amor de Mãe',
      preco: '129,90',
      descricao: 'Rosas em tons de rosa-chá e champanhe, finalizadas com folhagens nobres e embalagem premium em papel de seda e laço de cetim. Criado para agradecer a quem sempre cuidou de você.',
      itens: ['12 rosas selecionadas em tons delicados', 'Folhagens nobres e mosquitinho', 'Embalagem premium com laço de cetim', 'Cartão com mensagem personalizada']
    },
    tulipas: {
      nome: 'Jardim de Tulipas',
      preco: '149,90',
      descricao: 'Tulipas coloridas arranjadas em vaso de vidro com acabamento em fita natural. Um presente alegre, que dura dias e transforma qualquer ambiente.',
      itens: ['10 tulipas em cores variadas', 'Vaso de vidro incluso', 'Fita em tecido natural', 'Cartão com mensagem personalizada']
    },
    jardins: {
      nome: 'Buquê Jardins',
      preco: '119,90',
      descricao: 'Nosso buquê assinatura: uma seleção com as flores mais bonitas que chegam ao ateliê no dia, montada à mão pelas nossas floristas.',
      itens: ['Mix de flores da estação', 'Composição exclusiva do dia', 'Papel kraft e papel de seda', 'Cartão com mensagem personalizada']
    },
    box: {
      nome: 'Box Flores & Carinho',
      preco: '169,90',
      descricao: 'Uma caixa presenteável com arranjo de flores frescas e uma seleção de chocolates finos. Dois carinhos em um só presente.',
      itens: ['Arranjo de flores frescas', 'Chocolates finos (150 g)', 'Caixa rígida com tampa e laço', 'Cartão com mensagem personalizada']
    },
    rosas: {
      nome: 'Rosas Encantadas',
      preco: '139,90',
      descricao: 'O clássico que nunca sai de moda: rosas vermelhas, folhagens verdes e embalagem elegante para declarar amor com todas as letras.',
      itens: ['12 rosas vermelhas', 'Folhagens verdes selecionadas', 'Embalagem elegante com laço', 'Cartão com mensagem personalizada']
    },
    encanto: {
      nome: 'Encanto Rosa',
      preco: '159,90',
      descricao: 'Arranjo delicado em tons de rosa e branco, com peônias, rosas e lisianthus em vaso de cerâmica. Romântico, leve e cheio de significado.',
      itens: ['Peônias, rosas e lisianthus', 'Vaso de cerâmica branco', 'Composição em tons de rosa e branco', 'Cartão com mensagem personalizada']
    }
  };

  const modal = $('#modal-produto');
  const modalImg = $('#modal-img');

  function abrirProduto(id, botao) {
    const produto = produtos[id];
    if (!produto) return;
    const card = botao.closest('.produto');
    const imgCard = $('img', card);

    modalImg.classList.remove('is-loaded', 'is-error');
    modalImg.src = imgCard.currentSrc || imgCard.src;
    modalImg.alt = imgCard.alt;
    if (modalImg.complete && modalImg.naturalWidth) modalImg.classList.add('is-loaded');

    $('#modal-tag').textContent = $('.produto__tag', card).textContent;
    $('#modal-nome').textContent = produto.nome;
    $('#modal-preco').innerHTML = `<small>R$</small> ${produto.preco}`;
    $('#modal-desc').textContent = produto.descricao;

    const lista = $('#modal-itens');
    lista.replaceChildren(...produto.itens.map((item) => {
      const li = document.createElement('li');
      li.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#i-check"/></svg>';
      li.append(item);
      return li;
    }));

    const mensagem = `Olá, Jardins! Tenho interesse no ${produto.nome} (R$ ${produto.preco}). Pode me ajudar com o pedido?`;
    $('#modal-whats').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;

    abrirDialogo(modal);
  }

  $$('[data-produto]').forEach((botao) => {
    botao.addEventListener('click', () => abrirProduto(botao.dataset.produto, botao));
  });

  // Favoritar
  $$('.produto__fav').forEach((botao) => {
    botao.addEventListener('click', () => {
      const ativo = botao.getAttribute('aria-pressed') === 'true';
      botao.setAttribute('aria-pressed', String(!ativo));
      botao.classList.remove('pop');
      void botao.offsetWidth; // reinicia a animação
      if (!ativo) botao.classList.add('pop');
    });
  });

  /* ---------- Carrossel de depoimentos ---------- */
  const carrossel = $('.carrossel');
  if (carrossel) {
    const trilho = $('.carrossel__trilho', carrossel);
    const slides = $$('.depo', carrossel);
    const areaPontos = $('.carrossel__pontos', carrossel);
    let atual = 0;
    let timer = null;

    const pontos = slides.map((_, i) => {
      const ponto = document.createElement('button');
      ponto.type = 'button';
      ponto.className = 'carrossel__ponto';
      ponto.setAttribute('aria-label', `Mostrar avaliação ${i + 1}`);
      ponto.addEventListener('click', () => { irPara(i); reiniciar(); });
      areaPontos.appendChild(ponto);
      return ponto;
    });

    function irPara(i) {
      atual = (i + slides.length) % slides.length;
      trilho.style.transform = `translate3d(calc(${-atual} * (100% + 24px)), 0, 0)`;
      slides.forEach((slide, k) => {
        slide.classList.toggle('is-ativo', k === atual);
        slide.setAttribute('aria-hidden', String(k !== atual));
      });
      pontos.forEach((ponto, k) => {
        if (k === atual) ponto.setAttribute('aria-current', 'true');
        else ponto.removeAttribute('aria-current');
      });
    }

    function parar() { clearInterval(timer); timer = null; }
    function iniciar() {
      if (movimentoReduzido.matches) return;
      parar();
      timer = setInterval(() => irPara(atual + 1), 6500);
    }
    function reiniciar() { parar(); iniciar(); }

    $$('.carrossel__seta', carrossel).forEach((seta) => {
      seta.addEventListener('click', () => { irPara(atual + Number(seta.dataset.dir)); reiniciar(); });
    });

    carrossel.addEventListener('mouseenter', parar);
    carrossel.addEventListener('mouseleave', iniciar);
    carrossel.addEventListener('focusin', parar);
    carrossel.addEventListener('focusout', iniciar);
    carrossel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') irPara(atual - 1);
      if (e.key === 'ArrowRight') irPara(atual + 1);
    });

    // deslizar com o dedo
    let inicioX = null;
    trilho.addEventListener('touchstart', (e) => { inicioX = e.touches[0].clientX; }, { passive: true });
    trilho.addEventListener('touchend', (e) => {
      if (inicioX === null) return;
      const dx = e.changedTouches[0].clientX - inicioX;
      if (Math.abs(dx) > 40) { irPara(atual + (dx < 0 ? 1 : -1)); reiniciar(); }
      inicioX = null;
    });

    irPara(0);
    iniciar();
  }

  /* ---------- Galeria com lightbox ---------- */
  const itensGaleria = $$('.galeria__item');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const lightboxLegenda = $('#lightbox-legenda');
  let indiceGaleria = 0;

  function mostrarImagem(i) {
    indiceGaleria = (i + itensGaleria.length) % itensGaleria.length;
    const item = itensGaleria[indiceGaleria];
    const img = $('img', item);
    lightboxImg.src = img.src.replace(/([?&]w=)\d+/, '$11600');
    lightboxImg.alt = img.alt;
    lightboxLegenda.textContent = item.dataset.legenda;
    lightboxImg.style.animation = 'none';
    void lightboxImg.offsetWidth;
    lightboxImg.style.animation = '';
  }

  itensGaleria.forEach((item, i) => {
    item.addEventListener('click', () => {
      mostrarImagem(i);
      abrirDialogo(lightbox);
    });
  });
  $$('.lightbox__seta', lightbox).forEach((seta) => {
    seta.addEventListener('click', () => mostrarImagem(indiceGaleria + Number(seta.dataset.dir)));
  });
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostrarImagem(indiceGaleria - 1);
    if (e.key === 'ArrowRight') mostrarImagem(indiceGaleria + 1);
  });

  /* ---------- Loja aberta agora? (horário de São Paulo) ---------- */
  try {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    const valor = (tipo) => partes.find((p) => p.type === tipo).value;
    const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'));
    const hora = (Number(valor('hour')) % 24) + Number(valor('minute')) / 60;
    const horarios = { 0: [9, 13], 6: [8, 16] };
    const [abre, fecha] = horarios[dia] || [8, 18];
    const aberta = hora >= abre && hora < fecha;

    const status = $('#status-loja');
    status.textContent = aberta ? 'Aberto agora' : 'Fechado agora';
    status.classList.toggle('is-fechada', !aberta);
    status.hidden = false;

    $$('.loja__horarios [data-dias]').forEach((linha) => {
      linha.classList.toggle('is-hoje', linha.dataset.dias.split(',').includes(String(dia)));
    });
  } catch (erro) {
    /* navegador sem suporte a fuso horário: o status simplesmente não aparece */
  }

  /* ---------- Formulário de contato ---------- */
  const form = $('#form-contato');
  const camposForm = $('.form__campos', form);
  const sucesso = $('.form__sucesso', form);
  const telefone = $('#telefone');

  function mascaraTelefone(valor) {
    const d = valor.replace(/\D/g, '').slice(0, 11);
    if (!d) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  telefone.addEventListener('input', () => { telefone.value = mascaraTelefone(telefone.value); });

  const regras = {
    nome: (v) => v.trim().length >= 2 || 'Conte para nós o seu nome.',
    telefone: (v) => v.replace(/\D/g, '').length >= 10 || 'Informe um telefone com DDD, como (11) 99999-9999.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Informe um e-mail válido, como voce@email.com.',
    mensagem: (v) => v.trim().length >= 10 || 'Escreva uma mensagem com pelo menos 10 caracteres.'
  };

  function validar(campo) {
    const resultado = regras[campo.name](campo.value);
    const valido = resultado === true;
    const caixa = campo.closest('.campo');
    caixa.classList.toggle('is-erro', !valido);
    $('.campo__erro', caixa).textContent = valido ? '' : resultado;
    campo.setAttribute('aria-invalid', String(!valido));
    return valido;
  }

  const campos = $$('input, textarea', form);
  campos.forEach((campo) => {
    campo.addEventListener('blur', () => { if (campo.value) validar(campo); });
    campo.addEventListener('input', () => {
      if (campo.closest('.campo').classList.contains('is-erro')) validar(campo);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const resultados = campos.map(validar);
    const primeiroInvalido = campos[resultados.indexOf(false)];
    if (primeiroInvalido) {
      primeiroInvalido.focus();
      return;
    }

    const botao = $('button[type="submit"]', form);
    const texto = $('.btn__txt', botao);
    botao.disabled = true;
    botao.classList.add('is-enviando');
    texto.textContent = 'Enviando...';

    // Demonstração: aqui entraria o envio real (ex.: Formspree, EmailJS ou um back-end).
    setTimeout(() => {
      const primeiroNome = $('#nome').value.trim().split(/\s+/)[0];
      $('#sucesso-nome').textContent = `Obrigado, ${primeiroNome}`;
      camposForm.hidden = true;
      sucesso.hidden = false;
      botao.disabled = false;
      botao.classList.remove('is-enviando');
      texto.textContent = 'Enviar mensagem';
    }, 1100);
  });

  $('#nova-mensagem').addEventListener('click', () => {
    form.reset();
    campos.forEach((campo) => {
      campo.removeAttribute('aria-invalid');
      campo.closest('.campo').classList.remove('is-erro');
    });
    sucesso.hidden = true;
    camposForm.hidden = false;
    $('#nome').focus();
  });
})();
