# Blocos disponíveis

<br/>

## Textos

Os textos podem ser escritos diretament no documento.
Deve ser usado as tags de HTML para o itálico `<em>texto</em>`, para o bold `<strong>texto</strong>`

Grandes blocos de texto devem ser colocados dentro de secções `[.+seccao] ... []`

Um artigo tanto pode ter apenas uma secção (no caso de ser pequeno) como múltiplas secções (no caso de ser um artigo grande).
Imaginem as secções como capítulos.

### Valores específicos

![Introdução](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/intro.png)

Há quatro valores espcífico que podem ser usados `entrada`, `autores`, `data` e `subtitulo`.

```
entrada: Foi o maior movimento migratório do século XX para Portugal. À chegada, muitos tiveram um choque. Eram o “lembrete” de um passado desconfortável e o regresso de Portugal às suas pequenas fronteiras. Há quem sublinhe que o 25 de Abril foi antifascista, mas não anti-racista.

autores: Alex Santos (web design), Ana Xavier (design), Inês Oliveira (design), Nuno Moura (web design), Rodrigo Julião (web design)

data: 18 de Agosto de 2024
```

O `subtitulo` pode ser usado entre parágrafos.

<br/>

## Imagem

![imagem](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/image.png)

Bloco para introduzir uma única imagem.

`size: small / medium / large`

`ratio: ratio-1-1 / ratio-2-3 / ratio-3-2 / ratio-4-5 / ratio-5-4 / ratio-16-9`

```
{.imagem}
size: small
ratio: ratio-3-2

src: https://imagens.publico.pt/imagens.aspx/1931098?tp=UH&db=IMAGENS&type=JPG&w=1400&act=resize
caption: Marc Márquez
credit: Honda
{}
```

<br/>

## Duas Imagens

![Duas imagens](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/image-2.png)

Bloco para introduzir duas imagens lado a lado.

`ratio: ratio-1-1 / ratio-2-3 / ratio-3-2 / ratio-4-5 / ratio-5-4 / ratio-16-9`

```
{.imagens-2}
ratio1: ratio-1-1
src1: https://imagens.publico.pt/imagens.aspx/1924876?tp=UH&db=IMAGENS&type=JPG&w=2048&act=resize
caption1: Francesco Bagnaia
credit1: Ducati

ratio2: ratio-1-1
src2: https://imagens.publico.pt/imagens.aspx/1919333?tp=UH&db=IMAGENS&type=JPG&w=2048&act=resize
caption2: Fabio Quartararo
credit2: Yamaha
{}
```

<br/>

## Três Imagens

![Três imagens](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/image-3.png)

Bloco para introduzir três imagens lado a lado.

`ratio: ratio-1-1 / ratio-2-3 / ratio-3-2 / ratio-4-5 / ratio-5-4 / ratio-16-9`

```
{.imagens-3}
ratio1: ratio-1-1
src1: https://imagens.publico.pt/imagens.aspx/805551?tp=KM&db=IMAGENS&db=IMAGENS&w=1646&type=JPG
caption1: Franco Morbidelli
credit1: Yamaha

ratio2: ratio-1-1
src2: https://imagens.publico.pt/imagens.aspx/805561?tp=KM&db=IMAGENS&type=JPG
caption2: Aleix Espargaró
credit2: Aprilia 

ratio3: ratio-1-1
src3: https://imagens.publico.pt/imagens.aspx/805556?tp=KM&db=IMAGENS&type=JPG
caption3: Jack Miller
credit3: KTM
{}
```

<br/>

## Imagem sticky

![Imagem sticky](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/image-sticky.png)

Bloco em que a imagem fica estática no ecrã enquanto uma descrição passsa por cima ao fazer scroll

`size: small / medium / fullscreen`

```
{.imagem-sticky}
size: small
src: https://static.publico.pt/s3/files/videos/multimedia/retornados/cover/cover--cap-4.png
caption: Em 2019, as partículas de plástico a flutuar nos oceanos atingiram 2,3 milhões de toneladas, segundo novo estudo. É preciso “um tratado das Nações Unidas muito forte” contra o plástico, diz cientista.
{}
```

<br/>

## Vídeo

![Vídeo](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/video.png)

Bloco para introduzir apenas um vídeo.

`size: small / medium / large`

`autoplay: yes / no`

`loop: yes / no`

`controls: yes / no`

`videoMuted: yes / no` (se o vídeo estiver em mute, o botão de unmute não aparece)

```
{.video}
size: small
autoplay: yes
loop: yes
controls: no
videoMuted: no

src: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2023/ai_weiwei.mp4
poster: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2023/poster-ai_weiwei-04.png

caption: Joan Mir
credit: Honda
{}
```

<br/>

## Dois vídeos

![Dois vídeos](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/videos-2.png)

Bloco para introduzir dois vídeos lado a lado.

`ratio: ratio-1-1 / ratio-2-3 / ratio-3-2 / ratio-4-5 / ratio-5-4 / ratio-16-9`

`autoplay: yes / no`

`loop: yes / no`

`controls: yes / no`

`videoWithSound: 1 / 2` -> `1` - apenas o primeiro vídeo vai ter som. `2` - apenas o segundo vídeo vai ter som. Com outro valor, ambos os vídeos vão estar em mute.

```
{.videos-2}
ratio: ratio-1-1
controls: no
loop: yes
autoplay: yes
videoWithSound: 1

videoPoster1: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2023/poster-ai_weiwei-04.png
videoSrc1: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2023/ai_weiwei.mp4
videoCaption1: Brad Binder
videoCredit1: KTM

videoPoster2: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2024/video/mth.png
videoSrc2: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2024/video/mth.mp4
videoCaption2: Johann Zarco
videoCredit2: Ducati
{}
```

<br/>

## Vídeo e imagem

![Vídeo e imagem](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/video-image.png)

Bloco para introduzir um vídeo e uma imagem lado a lado.

`ratio: ratio-1-1 / ratio-2-3 / ratio-3-2 / ratio-4-5 / ratio-5-4 / ratio-16-9`

`videoSide: right / left`

`autoplay: yes / no`

`loop: yes / no`

`controls: yes / no`

`videoMuted: yes / no`

```
{.video-image}
videoSide: right
ratio: ratio-1-1
controls: no
loop: yes
autoplay: yes
videoMuted: no

videoPoster: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2023/poster-ai_weiwei-04.png
videoSrc: https://static.publico.pt/files/sente-se-na-minha-cadeira/media/aniversario2023/ai_weiwei.mp4
videoCaption: Alex Márquez
videoCredit: Ducati

imageSrc: https://imagens.publico.pt/imagens.aspx/1893550?tp=UH&db=IMAGENS&type=JPG&w=1400&act=resize
imageCaption: Fabio Di Giannantonio
imageCredit: Ducati
{}
```

<br/>


<br/>

## Bloco série

![Bloco série](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/bloco-serie.png)

Bloco com link para a landing page da série.

```
{.bloco-serie}
image: https://static.publico.pt/files/50anos25abril/assets/cravo--master.png
title: <span>Racismo em português 2</span>Colonos em Angola e Moçambique. Retornados em Portugal
btnText: Ver série
url: https://www.publico.pt/multimedia/interactivo/racismo-em-portugues-2
{}
```

<br/>

## Artigo série

![Artigo série](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/artigo-serie.png)

Bloco com link para os artigos da mesma série.

```
{.artigo-serie}
pretitle: Cronologia
title: 1974-2024: como as mulheres romperam o cerco
url:https://www.publico.pt/multimedia/interactivo/como-as-mulheres-romperam-o-cerco/cronologia
image:https://static.publico.pt/files/site/25abrilmulheres/media/LR-PINTASILGO-6-241001.jpg
{}
```

<br/>

## Artigo relacionado

![Artigo relacionado](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/artigo-relacionado.png)

Bloco para artigos genéricos relacionados com o tema do artigo

`float: left / right`

```
{.artigo-relacionado}
float: right

title: Uma falsificadora conta a sua história
url:https://www.publico.pt/2018/04/25/politica/noticia/uma-falsificadora-conta-a-sua-historia-1811604
image:https://imagens.publico.pt/imagens.aspx/1219903?tp=UH&db=IMAGENS&type=JPG&w=1400&act=resize
{}
```

<br/>


## Quebra de linha

Divisão entre blocos. Não aceita qualquer valor

```
{.quebra-linha}
{}
```

<br/>


## Side note

![Side note](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/side-note.png)

Bloco para dar contexto com informação secundária.

```
{.side-note}
value: Este cão robô é o novo polícia de trânsito de Málaga (e não gosta de trotinetas eléctricas). A polícia de trânsito usou o cão robô numa patrulha pelo centro da cidade. Tem quatro pernas mecânicas e uma sirene no lugar do dorso.
{}
```

<br/>


## Bibliografia

![Bibliografia](https://static.publico.pt/files/sente-se-na-minha-cadeira/media/archieml/bibliografia.png)

Bloco para apresentar os materiais usados no artigo.

```
[.+bibliografia]
<em>Elas estiveram nas prisões do fascismo</em>, URAP – União de Resistentes Antifascistas Portugueses, 4.ª ed., 2023.
<em>Homenagem a Maria José Ribeiro</em>, entrevista conduzida por Maria Celestina de Leão Gomes, URAP – União de Resistentes Antifascistas Portugueses, 2016.
<em>Tarrafal</em>, testemunhos, trabalho colectivo de sobreviventes do Tarrafal, coordenado por Franco de Sousa, Editorial Caminho, 1978.
LAMAS, Maria, <em>As Mulheres do meu País</em>, Caminho, 2003
PIMENTAL Irene Flunser e MELO, Helena Pereira de, <em>Mulheres portuguesas - História da vida e dossier direitos das mulheres num mundo em mudança</em>, Clube do Autor, 2015.
TAVARES, Manuela, <em>Feminismos: percursos e desafios</em> (1947-2007), Texto, 2011.
[]
```

<br/>
---

<br/>
<br/>

# Setup do ArchieML

Para fazer o parse de um ficheiro Google Doc usando o ArchieML, estou a user o plugin aml-gdoc-server: https://github.com/Quartz/aml-gdoc-server

Depois de o plugin estar instalado e de todas as credenciais/permissões estarem resolvidas, correr o comando "aml-gdoc-server" no Terminal. A estrutura do url é:

http://127.0.0.1:6006/{google-doc-id}

Guia de como usar o ArchieML: http://archieml.org/

Terminada a data de expiração, é necessário apagar o ficheiro .aml-gdoc-credentials (pasta amsantos) e voltar a correr o comando "aml-gdoc-server". Inserir dados pedidos e que estão em: https://console.cloud.google.com/apis/credentials?pli=1&project=alexmsantos

Testar o ficheiro colocando este url no browser: http://127.0.0.1:6006/1zyBB2N_dw0ID9mLEW04OpK4o5eqz1de5m_sm0Eo8rPc (db/archieml) ou correndo um curl para gravar tudo num ficheiro data.js. Para isso, abrir um novo terminal e correr: 

curl "http://127.0.0.1:6006/{google-doc-id}" > /tmp/out && echo 'const data =' | cat - /tmp/out > /Users/amsantos/Sites/publico-hp2022/src/specials/20240130_25-abril-mulheres/assets/js/data-01.js

ou 

curl "url-to-file" | jq -r tostring > path-to-file/file.json

exemplo artigo 1: curl "http://127.0.0.1:6006/1UvwuykXzZVSm8BYiNKE6DFN-Si2huQUDRuZ_LohnWlk" | jq -r tostring > /Users/amsantos/Sites/data/mulheres25abril/data-01.json

