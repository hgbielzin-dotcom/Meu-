#!/usr/bin/env python3
"""
Gera a narração do vídeo do plano de Dia das Mães.

Para cada frase: sintetiza a voz (RHVoice, voz brasileira Letícia), mede a duração
e monta a linha do tempo. Saídas, na pasta video/:
  narracao.js   → tempos das cenas e frases, lido por apresentacao.html (animações e legendas)
  narracao.wav  → faixa de áudio completa, sincronizada com o vídeo
  legendas.srt  → legendas no formato SRT (para YouTube, players etc.)

Uso:  python3 video/narracao.py
Requer: RHVoice-test com a voz Leticia-F123 (pacote rhvoice-brazilian-portuguese).
"""
import array
import json
import os
import subprocess
import tempfile
import wave

PASTA = os.path.dirname(os.path.abspath(__file__))
VOZ = "Leticia-F123"
TAXA = 24000          # Hz, saída do RHVoice
FADE = 0.7            # sobreposição entre cenas (igual ao apresentacao.html)
ENTRADA = 0.9         # silêncio no início de cada cena, antes da primeira frase
PAUSA = 0.35          # pausa entre frases
SAIDA = 1.3           # respiro no fim de cada cena

# Cada frase tem a legenda (o que aparece na tela) e, quando precisa, a fala
# (o mesmo texto escrito do jeito que a voz deve pronunciar: números por extenso etc.).
CENAS = [
    ("Abertura", [
        ("Oi, gente! Tudo bem?", None),
        ("A Floricultura Jardins tem 30 dias para se preparar para o Dia das Mães.",
         "A Floricultura Jardins tem trinta dias para se preparar para o Dia das Mães."),
        ("Bora ver os cronogramas, a logística e a montagem do stand?",
         "Bora ver os cronogramas, a logística e a montagem do estande?"),
    ]),
    ("Três frentes", [
        ("O plano é dividido em três frentes.", None),
        ("Do dia 1 ao 10, compras e estoque.", "Do dia um ao dez, compras e estoque."),
        ("Do dia 11 ao 20, ponto de vendas e stand.", "Do dia onze ao vinte, ponto de vendas e estande."),
        ("E as encomendas vão do dia 11 até o dia 30.", "E as encomendas vão do dia onze até o dia trinta."),
    ]),
    ("Compras", [
        ("Começando pelas compras, nos dez primeiros dias.", None),
        ("Primeiro, a gente pesquisa os fornecedores: R$ 500 e 2 pessoas.",
         "Primeiro, a gente pesquisa os fornecedores: quinhentos reais e duas pessoas."),
        ("Depois vêm as flores, com R$ 5.000 e 3 pessoas.",
         "Depois vêm as flores, com cinco mil reais e três pessoas."),
        ("Embalagens custam R$ 1.500, e presentes, R$ 2.000.",
         "Embalagens custam mil e quinhentos reais, e presentes, dois mil."),
        ("No total, são R$ 9.000, com os 3 funcionários fixos se revezando.",
         "No total, são nove mil reais, com os três funcionários fixos se revezando."),
        ("Ah, e um detalhe: as flores chegam só na semana do Dia das Mães, pra ficarem fresquinhas.", None),
    ]),
    ("Ponto de vendas", [
        ("Agora, o ponto de vendas, do dia 11 ao dia 20.", "Agora, o ponto de vendas, do dia onze ao dia vinte."),
        ("Ele inclui o nosso stand na feira.", "Ele inclui o nosso estande na feira."),
        ("São R$ 1.500 em organização e decoração, R$ 800 em divulgação e R$ 500 no estoque.",
         "São mil e quinhentos reais em organização e decoração, oitocentos em divulgação e quinhentos no estoque."),
        ("Tudo isso dá R$ 2.800.", "Tudo isso dá dois mil e oitocentos reais."),
        ("E a equipe cresce: 3 funcionários fixos e mais 4 temporários.",
         "E a equipe cresce: três funcionários fixos e mais quatro temporários."),
    ]),
    ("Logística do stand", [
        ("E como funciona a logística do stand?", "E como funciona a logística do estande?"),
        ("As flores saem da loja bem cedinho, num utilitário fechado, em baldes com água.", None),
        ("Todo dia tem reposição de flores frescas, com sombra e água no stand.",
         "Todo dia tem reposição de flores frescas, com sombra e água no estande."),
        ("A estrutura tem balcão, prateleiras, painel com o logotipo e iluminação.", None),
        ("No atendimento, ficam 2 temporários por turno e 1 fixo responsável, aceitando cartão, Pix e QR Code.",
         "No atendimento, ficam dois temporários por turno e um fixo responsável, aceitando cartão, pix e quê érre côde."),
    ]),
    ("Montagem do stand", [
        ("Agora, a montagem do stand, passo a passo.", "Agora, a montagem do estande, passo a passo."),
        ("No dia 11, a gente reserva o espaço e desenha a planta.",
         "No dia onze, a gente reserva o espaço e desenha a planta."),
        ("Do dia 12 ao 14, cuidamos da estrutura e da decoração.",
         "Do dia doze ao catorze, cuidamos da estrutura e da decoração."),
        ("Nos dias 15 e 16, é hora da divulgação.", "Nos dias quinze e dezesseis, é hora da divulgação."),
        ("Nos dias 17 e 18, montamos tudo no local.", "Nos dias dezessete e dezoito, montamos tudo no local."),
        ("No dia 19, abastecemos o estoque e testamos os pagamentos.",
         "No dia dezenove, abastecemos o estoque e testamos os pagamentos."),
        ("E no dia 20, o stand abre as portas, com a equipe completa!",
         "E no dia vinte, o estande abre as portas, com a equipe completa!"),
    ]),
    ("Encomendas", [
        ("Bora falar das encomendas.", None),
        ("Os pedidos podem ser feitos do dia 11 ao dia 27.", "Os pedidos podem ser feitos do dia onze ao dia vinte e sete."),
        ("E, do dia 21 ao 27, a equipe monta os pedidos com calma.",
         "E, do dia vinte e um ao vinte e sete, a equipe monta os pedidos com calma."),
        ("As retiradas são no dia 28, para os pedidos antecipados, no dia 29, para os regulares, e no dia 30, para os finais.",
         "As retiradas são no dia vinte e oito, para os pedidos antecipados, no dia vinte e nove, para os regulares, e no dia trinta, para os finais."),
        ("Quatro funcionários cuidam só das encomendas.", None),
    ]),
    ("Cronograma geral", [
        ("Juntando tudo, olha como fica o cronograma geral.", None),
        ("Primeiro as compras, depois o ponto de vendas e o stand.",
         "Primeiro as compras, depois o ponto de vendas e o estande."),
        ("As encomendas correm em paralelo, e a preparação dos pedidos vem logo depois.", None),
        ("No fim, os três dias de retiradas e atendimento intensivo.", None),
        ("E no dia 30, a preparação está encerrada.", "E no dia trinta, a preparação está encerrada."),
    ]),
    ("Orçamento e equipe", [
        ("E quanto custa tudo isso?", None),
        ("O orçamento total é de R$ 11.800.", "O orçamento total é de onze mil e oitocentos reais."),
        ("São R$ 9.000 em compras e R$ 2.800 no ponto de vendas e no stand.",
         "São nove mil reais em compras e dois mil e oitocentos no ponto de vendas e no estande."),
        ("A equipe tem 3 funcionários fixos e 4 temporários, chegando a 7 pessoas no pico do movimento.",
         "A equipe tem três funcionários fixos e quatro temporários, chegando a sete pessoas no pico do movimento."),
    ]),
    ("Encerramento", [
        ("Com tudo planejado, a Jardins está prontinha para o Dia das Mães.", None),
        ("Valeu, gente, e até a próxima!", None),
    ]),
]


def sintetiza(texto, destino):
    subprocess.run(["RHVoice-test", "-p", VOZ, "-R", str(TAXA), "-o", destino],
                   input=texto.encode("utf-8"), check=True, capture_output=True)
    with wave.open(destino, "rb") as w:
        assert w.getframerate() == TAXA and w.getnchannels() == 1 and w.getsampwidth() == 2
        dados = array.array("h", w.readframes(w.getnframes()))
    # tira o silêncio que o sintetizador deixa nas pontas
    limiar = 300
    ini = next((i for i, v in enumerate(dados) if abs(v) > limiar), 0)
    fim = len(dados) - next((i for i, v in enumerate(reversed(dados)) if abs(v) > limiar), 0)
    margem = int(0.04 * TAXA)
    return dados[max(0, ini - margem):min(len(dados), fim + margem)]


def tempo_srt(s):
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    seg, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{seg:02d},{ms:03d}"


def main():
    cenas_saida, clipes = [], []
    inicio_cena = 0.0
    with tempfile.TemporaryDirectory() as tmp:
        for n, (nome, frases) in enumerate(CENAS):
            t = ENTRADA
            segs = []
            for k, (legenda, fala) in enumerate(frases):
                amostras = sintetiza(fala or legenda, os.path.join(tmp, f"{n}-{k}.wav"))
                dur = len(amostras) / TAXA
                segs.append({"legenda": legenda, "inicio": round(t, 3), "fim": round(t + dur, 3)})
                clipes.append((inicio_cena + t, amostras))
                t += dur + PAUSA
            dur_cena = round(t - PAUSA + SAIDA, 3)
            cenas_saida.append({"nome": nome, "inicio": round(inicio_cena, 3), "dur": dur_cena, "frases": segs})
            inicio_cena += dur_cena - FADE

    total = cenas_saida[-1]["inicio"] + cenas_saida[-1]["dur"]
    faixa = array.array("h", bytes(2 * int(total * TAXA + TAXA)))
    for t0, amostras in clipes:
        p = int(t0 * TAXA)
        faixa[p:p + len(amostras)] = amostras
    with wave.open(os.path.join(PASTA, "narracao.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes(faixa.tobytes())

    with open(os.path.join(PASTA, "narracao.js"), "w", encoding="utf-8") as f:
        f.write("// Gerado por narracao.py: tempos de cada cena e de cada frase narrada (em segundos).\n")
        f.write("window.NARRACAO = ")
        json.dump({"fade": FADE, "total": round(total, 3), "cenas": cenas_saida}, f, ensure_ascii=False, indent=1)
        f.write(";\n")

    linhas, i = [], 1
    for c in cenas_saida:
        for s in c["frases"]:
            linhas += [str(i), f"{tempo_srt(c['inicio'] + s['inicio'])} --> {tempo_srt(c['inicio'] + s['fim'] + 0.2)}", s["legenda"], ""]
            i += 1
    with open(os.path.join(PASTA, "legendas.srt"), "w", encoding="utf-8") as f:
        f.write("\n".join(linhas))

    print(f"{len(clipes)} frases · duração total {total:.1f} s")
    for c in cenas_saida:
        print(f"  {c['inicio']:6.1f}s  {c['dur']:5.1f}s  {c['nome']}")


if __name__ == "__main__":
    main()
