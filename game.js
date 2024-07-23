// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
  constructor() {
    this.width = 50;
    this.height = 50;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 8;
  }

  draw() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  moveLeft() {
    if (this.x > 0) this.x -= this.speed;
  }

  moveRight() {
    if (this.x + this.width < canvas.width) this.x += this.speed;
  }
}

class Projectile {
  constructor(x, y, isSpecial = false) {
    this.x = x;
    this.y = y;
    this.width = isSpecial ? 20 : 10;
    this.height = isSpecial ? 60 : 40;
    this.speed = isSpecial ? 20 : 15;
    this.color = isSpecial ? 'yellow' : 'red';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y -= this.speed;
  }
}

class Enemy {
  constructor(x, y, width = 50, height = 50, speed = 2, color = 'green') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.color = color;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
  }
}

class Item {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 30;
    this.speed = 2;
    this.color = 'gold';
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
  }
}

function detectCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y;
}

let player;
let projectiles;
let enemies;
let items;
let keys = {};
let gameOver = false;
let lastProjectileTime = 0;
let score = 0;

function initializeGame() {
  player = new Player();
  projectiles = [];
  enemies = [];
  items = [];
  keys = {};
  gameOver = false;
  lastProjectileTime = 0;
  score = 0;
  spawnEnemies();
  spawnItems();
  update();
}

window.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  if (e.key === ' ' && gameOver) {
    initializeGame();
  }
});

window.addEventListener('keyup', (e) => {
  delete keys[e.key];
});

function spawnEnemies() {
  setInterval(() => {
    if (!gameOver) {
      const x = Math.random() * (canvas.width - 50);
      const isSpecial = Math.random() < 0.3;
      if (isSpecial) {
        const type = Math.floor(Math.random() * 5);
        switch (type) {
          case 0:
            enemies.push(new Enemy(x, 0, 70, 70, 1, 'purple'));
            break;
          case 1:
            enemies.push(new Enemy(x, 0, 40, 40, 4, 'orange'));
            break;
          case 2:
            enemies.push(new Enemy(x, 0, 50, 50, 3, 'blue'));
            break;
          case 3:
            enemies.push(new Enemy(x, 0, 100, 100, 0.5, 'red'));
            break;
          case 4:
            enemies.push(new Enemy(x, 0, 60, 60, 2.5, 'cyan'));
            break;
        }
      } else {
        enemies.push(new Enemy(x, 0));
      }
    }
  }, 1000);
}

function spawnItems() {
  setInterval(() => {
    if (!gameOver) {
      const x = Math.random() * (canvas.width - 30);
      items.push(new Item(x, 0));
    }
  }, 10000); // 10초마다 아이템 생성
}

function update() {
  const now = Date.now();

  if (keys['ArrowLeft']) player.moveLeft();
  if (keys['ArrowRight']) player.moveRight();
  if (keys[' '] && now - lastProjectileTime > 200) {
    const isSpecial = Math.random() < 0.1;
    projectiles.push(new Projectile(player.x + player.width / 2 - (isSpecial ? 10 : 5), player.y, isSpecial));
    lastProjectileTime = now;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.draw();

  projectiles.forEach((projectile, projectileIndex) => {
    if (projectile.y < 0) {
      projectiles.splice(projectileIndex, 1);
    } else {
      projectile.update();
      projectile.draw();
    }
  });

  enemies.forEach((enemy, enemyIndex) => {
    if (enemy.y > canvas.height) {
      setGameOver();
    } else {
      enemy.update();
      enemy.draw();
    }

    if (detectCollision(enemy, player)) {
      setGameOver();
    }

    projectiles.forEach((projectile, projectileIndex) => {
      if (detectCollision(projectile, enemy)) {
        setTimeout(() => {
          enemies.splice(enemyIndex, 1);
          projectiles.splice(projectileIndex, 1);
          score += 10; // 적을 맞출 때 점수 증가
        }, 0);
      }
    });
  });

  items.forEach((item, itemIndex) => {
    if (item.y > canvas.height) {
      items.splice(itemIndex, 1);
    } else {
      item.update();
      item.draw();
    }

    if (detectCollision(item, player)) {
      items.splice(itemIndex, 1);
      score += 50; // 아이템을 획득할 때 점수 증가
    }
  });

  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.fillText(`Score: ${score}`, 10, 30);

  if (!gameOver) {
    requestAnimationFrame(update);
  } else {
    displayGameOver();
  }
}

function setGameOver() {
  gameOver = true;
}

function displayGameOver() {
  ctx.fillStyle = 'white';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
  ctx.font = '24px sans-serif';
  ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);
}

initializeGame();
