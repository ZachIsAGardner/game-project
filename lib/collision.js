class Collision {
  constructor(object, ctx) {
    this.ctx = ctx;
    this.raycastAmount = 4;
    //Prevents a hit with a collider below the square
    this.skin = 0.5;

    this.object = object;
    this.shape = object.shape;
    this.vel = object.vel;

    this.colliders = object.colliders;
    this.grounded = false;
  }

  collisions() {
    this.horizontalCollisions();
    this.grounded = this.verticalCollisions();
  }

  horizontalCollisions() {
    for (var i = 0; i < this.raycastAmount; i++) {
      let startX;
      let endX;

      let spacing = (i * ((this.shape.height - this.skin) / (this.raycastAmount - 1))) + (this.skin / 2);

      if (this.vel.x > 0) {
        startX = {
          x: this.shape.center().x + (this.shape.width / 2),
          y: this.shape.pos.y + spacing
        };
        endX = {
          x: this.shape.center().x + (this.shape.width / 2) + Math.abs(this.object.vel.x),
          y: this.shape.pos.y + spacing
        };
      } else {
        startX = {
          x: this.shape.center().x - (this.shape.width / 2),
          y: this.shape.pos.y + spacing
        };
        endX = {
          x: this.shape.center().x - (this.shape.width / 2) - Math.abs(this.object.vel.x),
          y: this.shape.pos.y + spacing
        };
      }

      let hit = this.raycast(startX, endX, 'horizontal');
      if (hit) {

        if (this.vel.x > 0) {
          this.shape.pos.x = (hit.collider.center().x - hit.collider.width / 2) - this.shape.width;
        } else {
          this.shape.pos.x = (hit.collider.center().x + hit.collider.width / 2);
        }
        this.vel.x = 0;
      }
    }
  }

  verticalCollisions() {

    let anyCollisions = false;

    for (var i = 0; i < this.raycastAmount; i++) {
      let startY;
      let endY;

      let spacing = (i * ((this.shape.width) / (this.raycastAmount - 1)));

      if (this.vel.y > 0) {
        startY = {
          x: this.shape.pos.x + spacing,
          y: this.shape.center().y + (this.shape.height / 2)
        };
        endY = {
          x: this.shape.pos.x + spacing,
          y: this.shape.center().y + (this.shape.height / 2) + Math.abs(this.object.vel.y)
        };
      } else {
        startY = {
          x: this.shape.pos.x + spacing,
          y: this.shape.center().y - (this.shape.height / 2)
        };
        endY = {
          x: this.shape.pos.x + spacing,
          y: this.shape.center().y - (this.shape.height / 2) - Math.abs(this.object.vel.y)
        };
      }

      let hit = this.raycast(startY, endY, 'vertical');
      if (hit) {
        if (this.vel.y > 0) {
          this.shape.pos.y = (hit.collider.center().y - hit.collider.height / 2) - this.shape.height;
        } else {
          this.shape.pos.y = (hit.collider.center().y + hit.collider.height / 2);
        }

        anyCollisions = true;
        this.vel.y = 0;
      }
    }

    return anyCollisions;
  }

  checkCollision(point, type) {
    //checks if point is within any of the colliders

    for (var i = 0; i < this.colliders.length; i++) {

      if (point.y > this.colliders[i].center().y - (this.colliders[i].height / 2)
       && point.y < this.colliders[i].center().y + (this.colliders[i].height / 2)) {

        if (point.x > this.colliders[i].center().x - (this.colliders[i].width / 2)
         && point.x < this.colliders[i].center().x + (this.colliders[i].width / 2)) {
          if (type === "horizontal") {
            debugger
          }
          return { collider: this.colliders[i]};

        }

      }

    }
  }

  raycast(start, end, type) {
    this.renderRaycast(start, end, 'red');
    return this.checkCollision(end, type);
  }

  renderRaycast(start, end, color) {
    this.ctx.beginPath();
    this.ctx.moveTo(start.x, start.y);
    this.ctx.lineTo(end.x, end.y);
    this.ctx.stroke();
  }
}

module.exports = Collision;