// estado de jogo
var JOGAR = 1;
var ENCERRAR = 0;
var estadoJogo = JOGAR;

// sprites
var trex, trex_correndo, trex_colidiu;
var solo, soloinvisivel, imagemdosolo;

// nuvens
var nuvem, grupodenuvens, imagemdanuvem;

// obstáculos
var grupodeobstaculos, obstaculo1, obstaculo2, obstaculo3, obstaculo4, obstaculo5, obstaculo6;

// pontuação e imagens de fim de jogo
var pontuacao;
var imgFimDeJogo,imgReiniciar

// sons
var somSalto , somCheckPoint, somMorte

// carrega recursos necessários antes do início do jogo
function preload() {
  trex_correndo = loadAnimation("trex1.png","trex3.png","trex4.png");
  trex_colidiu = loadAnimation("trex_collided.png");
  
  imagemdosolo = loadImage("ground2.png");
  imagemdanuvem = loadImage("cloud.png");
  
  obstaculo1 = loadImage("obstacle1.png");
  obstaculo2 = loadImage("obstacle2.png");
  obstaculo3 = loadImage("obstacle3.png");
  obstaculo4 = loadImage("obstacle4.png");
  obstaculo5 = loadImage("obstacle5.png");
  obstaculo6 = loadImage("obstacle6.png");
  
  imgReiniciar = loadImage("restart.png");
  imgFimDeJogo = loadImage("gameOver.png");
  
  somSalto = loadSound("jump.mp3");
  somMorte = loadSound("die.mp3");
  somCheckPoint = loadSound("checkPoint.mp3");
}

// função executada única vez no início para inicializar variáveis e criar sprites
function setup() {
  createCanvas(600, 200);
  
  trex = createSprite(50,180,20,50);
  trex.addAnimation("running", trex_correndo);
  trex.addAnimation("collided", trex_colidiu);
  trex.scale = 0.5;
  
  solo = createSprite(200,180,400,20);
  solo.addImage("ground", imagemdosolo);
  solo.x = solo.width / 2;
  
  fimDeJogo = createSprite(300,80);
  fimDeJogo.addImage(imgFimDeJogo);
  
  reiniciar = createSprite(300,120);
  reiniciar.addImage(imgReiniciar);
  
  fimDeJogo.scale = 0.5;
  reiniciar.scale = 0.5;
  
  soloinvisivel = createSprite(200,190,400,10);
  soloinvisivel.visible = false;
  
  // cria grupos de obstáculos e de nuvens
  grupodeobstaculos = createGroup();
  grupodenuvens = createGroup();
  
  trex.setCollider("rectangle", 0, 0, trex.width, trex.height);
  // trex.debug = true
  pontuacao = 0;
}

// função executada repetidamente, lógica principal do jogo
function draw() {
  background(180);
  text("Pontuação: "+ pontuacao, 500, 50);
  
  if(estadoJogo === JOGAR){
    fimDeJogo.visible = false;
    reiniciar.visible = false;
    
    // muda animação do Trex
    trex.changeAnimation("running", trex_correndo);
    solo.velocityX = -(2 + 1.5 * pontuacao / 500);
    
    pontuacao = pontuacao + Math.round(frameRate() / 60);
    
    if(pontuacao > 0 && pontuacao % 500 === 0) {
      somCheckPoint.play(); 
    }
    
    if (solo.x < 0) {
      solo.x = solo.width/2;
    }
    
    //salta quando Espace é pressionada
    if(keyDown("space") && trex.y >= 160) {
      trex.velocityY = -14;
      somSalto.play();
    }
    
    // adiciona gravidade
    trex.velocityY = trex.velocityY + 0.8;
    
    gerarNuvens();
    gerarObstaculos();
    
    if(grupodeobstaculos.isTouching(trex)) {
      // trex.velocityY = -12;
      // somSalto.play();
      estadoJogo = ENCERRAR;
      somMorte.play();  
    }
  } else if (estadoJogo === ENCERRAR) {
    fimDeJogo.visible = true;
    reiniciar.visible = true;
    
    // altera animação do Trex
    trex.changeAnimation("collided", trex_colidiu);
    
    solo.velocityX = 0;
    trex.velocityY = 0;
    
    // define tempo de vida dos objetos
    // (não sobrecarregar com excesso de objetos)
    grupodeobstaculos.setLifetimeEach(-1);
    grupodenuvens.setLifetimeEach(-1);
    grupodeobstaculos.setVelocityXEach(0);
    grupodenuvens.setVelocityXEach(0);   
    
    if(mousePressedOver(reiniciar) || keyDown("space")) {
      reset();
    }
  }
  trex.collide(soloinvisivel);
  drawSprites();
}

function reset() {
  estadoJogo = JOGAR;
  fimDeJogo.visible = false;
  reiniciar.visible = false;
  
  grupodeobstaculos.destroyEach();
  grupodenuvens.destroyEach();
  
  trex.changeAnimation("running",trex_correndo);
  pontuacao = 0;
}

function gerarObstaculos() {
  if (frameCount % 60 === 0) {
    var obstaculo = createSprite(600, 165, 10, 40);
    obstaculo.velocityX = -(4 + pontuacao / 500);
    
    //gera obstáculos aleatórios
    var rand = Math.round(random(1,6));
    switch(rand) {
      case 1: obstaculo.addImage(obstaculo1);
        break;
      case 2: obstaculo.addImage(obstaculo2);
        break;
      case 3: obstaculo.addImage(obstaculo3);
        break;
      case 4: obstaculo.addImage(obstaculo4);
        break;
      case 5: obstaculo.addImage(obstaculo5);
        break;
      case 6: obstaculo.addImage(obstaculo6);
        break;
      default: break;
    }
    
    obstaculo.scale = 0.5;
    obstaculo.lifetime = 300;
    grupodeobstaculos.add(obstaculo);
  }
}

function gerarNuvens() {
  if (frameCount % 60 === 0) {
    nuvem = createSprite(600, 100, 40, 10);
    nuvem.y = Math.round(random(80, 120));
    nuvem.addImage(imagemdanuvem);
    nuvem.scale = 0.5;
    nuvem.velocityX = -3;
    nuvem.lifetime = 200; 

    // ajusta profundidade
    nuvem.depth = trex.depth;
    trex.depth = trex.depth + 1;
    
    grupodenuvens.add(nuvem);
  }
}
