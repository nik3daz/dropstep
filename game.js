/*
 * Copyright (c) 2012, Christopher Lam
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those
 * of the authors and should not be interpreted as representing official policies, 
 * either expressed or implied, of the FreeBSD Project.
 */

GAME_FONT = "Calibri";
function start_game() {
    
  function setBgColors(frame, bg) {
    frameLayer.getChildren().forEach(function(x) {
      x.setFill(frame);
    });
    bgLayer.getChildren()[0].setFill(bg);
  }

    function toggleColors() {
        if (boxColor == cDGreen) {
      setBgColors(cRed, cLRed);
            boxColor = cDRed;
        } else {
      setBgColors(cGreen, cLGreen);
            boxColor = cDGreen;
        }
        for (var i = 0; i < boxes.length; i++) {
            boxes[i].setFill(boxColor);
        }
        frameLayer.floorRect.setFill(boxColor);
    frameLayer.draw();
    bgLayer.draw();
    }
  
    // Gravity switching
    function toggleGravity() {
    player.jumped = true;
        gravity = !gravity;
        if (gravity) {
            player.stopTail();
        } else {
            player.startTail(0, 60);
        }
        toggleColors();
    }

    // Keypress
    var keys = [];
    function doKeyDown(evt) {
    /*
      if (evt.keyCode == 90) {
            spikes.extend();
        }
      if (evt.keyCode == 89) {
            endgame();
    }
        if (evt.keyCode == 88) {
      firstDrop = true;
            makeCoin();
        }
        if (evt.keyCode == 87) {
            toggleGravity();
        }*/
    if (evt.keyCode == 82) {
            fadeIn(function() {
                reset();
            });
        }
    if (evt.keyCode >= 37 && evt.keyCode <= 40) {
      evt.preventDefault();
    }
        keys[evt.keyCode] = true;
    }
    
    function doKeyUp(evt) {
//        evt.preventDefault();
        keys[evt.keyCode] = false;
    }

    function doMouseUp(evt){
        dragTile = null;
        keys = [];
    }

    function valid(x, y) {
        return (x >= tl.x && y >= tl.x && x < br.x && y < br.y);
    }
    
    // Fade layer functions
    function fadeIn(cb, alpha) {
        if (!cb)
            cb = function() {};
        if (!alpha)
            alpha = 1
        fadeLayer.moveToTop();
        fadeLayer.transitionTo({
            duration : 0.5,
            alpha : alpha,
            callback : cb,
        });
    }

    function fadeOut(cb) {
        if (!cb)
            cb = function() {};
        fadeLayer.transitionTo({
            duration : 0.5,
            alpha : 0,
            callback : function() {
                fadeLayer.moveToBottom();
                cb();
            },
        });
    }

        

    function beginTerror() {
        var c = function() {
            makeCoin();
            timeouts.push(setTimeout(c, 1000));
        };

        c();

        var g = function() {
            if (game_over) return;
            flashColors(4, function() {
                firstDrop = true;
                toggleGravity();
                spikes.extend();
                timeouts.push(setTimeout(g, 8000));
                if (spikes.getEdge() >= stageWidth - 260) {
                    endgame();
                }
            });
        }
    var drop = firstCollect ? 2000 : 8000;
        timeouts.push(setTimeout(function() {
            g();
            patternLength = 0;
        }, drop));
//    console.log(drop);
    }

    function endgame() {
        bgLayer.exitText.flash();
        rwall_opening = true;
    }

    function Spikes() {

        var l = 15;
        var w = (br.y - tl.y) / 30;
        var pts = new Kinetic.Group({y: tl.y});
        for (var i = 0; i < br.y; i += w) {
            var p = [0, i, l, i + w/2, 0, i + w];
            var shape = new Kinetic.Polygon({
                points: p,
                fill: "black",
            });
            pts.add(shape);
        }
        this.box = new Kinetic.Rect({
            x: -stageWidth,
            width: stageWidth + 1,
            height: br.y - tl.y,
            fill: "black",
        })
        pts.add(this.box);
        var textCfg = {
            text: "Does it ever end?",
            lineHeight: 2,
            width: 100,
            fontFamily: GAME_FONT,
            fontSize: 8,
            x: -200,
            y: stageHeight / 4,
            textFill: "white",
        };
        pts.add(new Kinetic.Text(textCfg)); 
        textCfg.text = "Don't lose now..";
        textCfg.x = -400;
        pts.add(new Kinetic.Text(textCfg)); 
        textCfg.text = "If you suck less, you might find out";
        textCfg.x = -300;
        textCfg.y = stageHeight - 200;
        pts.add(new Kinetic.Text(textCfg)); 
        textCfg.text = "So close!";
        textCfg.x = -550;
        pts.add(new Kinetic.Text(textCfg)); 
        this.getEdge = function() {
            return pts.getX() + l - 12;
        }
        this.setEdge = function(x) {
            x += tl.x;
            pts.setX(x);
        }
        this.extend = function() {
            var dist = 40;
//      if (this.getEdge() > stageWidth * 2 / 3) dist = 20;
      for (var i = 0; i < coins.length; i++) {
        var c = coins[i];
        if (pts.getX() + dist * 3 / 2 + 10 > c.shape.getX()) {
          (function() {
            var g = c;
            setTimeout(function() {
              g.explode();
            }, 100);
          })();
          coins.splice(i--, 1);
          numCoins--;
        } else if (pts.getX() + dist + 10 > c.shape.getX()) {        
          c.explode();
          coins.splice(i--, 1);
          numCoins--;
        }
      }
            pts.transitionTo({
                easing: "elastic-ease-out",
                duration: 1.5,
                x: pts.getX() + dist,
            });
        }
    
        this.setEdge(-30);
        spikeLayer.add(pts);
        this.shape = pts;
    }

    function initLayers() {
        // Fade Layer
        var r = new Kinetic.Rect({
                width : stage.getWidth(),
                height : stage.getHeight(),
                strokeWidth : 0,
                fill : "#F4F7F7",
            });
        fadeLayer.add(r);
        fadeLayer.setAlpha(1);

    // HUD Layer
        hudLayer.scoreText = new Kinetic.Text({
            text: "",
            fontFamily: GAME_FONT,
            fontSize: 8,
            textFill: "white",
            x: br.x - 270,
            y: br.y + 22,
        });
        
        hudLayer.add(hudLayer.scoreText);

        hudLayer.hiScoreText = new Kinetic.Text({
            text: "HI 000000000000",
            fontFamily: GAME_FONT,
            fontSize: 8,
            textFill: "white",
            x: 30,
            y: br.y + 22,
        });
        
        hudLayer.add(hudLayer.hiScoreText);

    // Dead layer
        deadLayer.bg = new Kinetic.Rect({
      width: stageWidth,
      height: stageHeight,
      fill: "white",
    });
    deadLayer.add(deadLayer.bg);

        deadLayer.add(new Kinetic.Rect({
      width: 40,
      height: 40,
            x: stageWidth - 150,
            y: 100,
      fill: "white",
    }));

    deadLayer.scoreText = new Kinetic.Text({
      width: stageWidth,
      x: stageWidth / 2,
      y: tl.y + 80,
      align: 'center',
      offset: [stageWidth / 2, 0],
            text: "asdfasdf",
            fontFamily: GAME_FONT,
            fontSize: 15,
            textFill: "black",
        });
    deadLayer.add(deadLayer.scoreText);
    deadLayer.tipNum = 0;
    deadLayer.update = function() {
      var tips = [
        "You can jump at the peak of\n\na bounce for extra height",
        "Red gems double\n\nyour score AND multiplier!",
        "Go for red gems early",
        "MS Paint Adventures is\n\na great webcomic",
      ];
      var tip = tips[deadLayer.tipNum++];
            var escapedText = "x2 FREEDOM BONUS";
            if (!escaped) escapedText = "";
      if (deadLayer.tipNum >= tips.length) deadLayer.tipNum = 0;
      deadLayer.scoreText.setText(escapedText + "\n\nSCORE\n\n" + scoreString() + "\n\n\n\n\nProtip:\n\n" + tip + "\n\n\n\n\n\n\nPress R to fly again");
      deadLayer.draw();
    }
      // Bg Anim

        var addSquare = function() {
            var extra = 3 * Math.random();
            var r = new Kinetic.Rect({
                fill: "#FFFFFF",
                width: 8 + extra,
                height: 8 - extra,
                x: stageWidth,
                y: stageHeight * Math.random(),
                alpha: 0.2,
            });
            bgAnimLayer.add(r);
            r.transitionTo({
                x: 0,
                duration: 8 - extra,
                callback: function() {
                    bgAnimLayer.remove(r);
                },
            });
            setTimeout(addSquare, 100);
        }

        addSquare();
    
        initUI();
    }

    function initUI() {
        for (var i = 0; i < aabb.length; i++) {
            var p = aabb[i];
            var r = new Kinetic.Rect({
                width: p[2] - p[0],
                height: p[3] - p[1],
                x: p[0],
                y: p[1],
                fill: cGreen,
            });
            frameLayer.add(r);
        }
        frameLayer.rwall = [];
        for (var i = 0; i < rwall.length; i++) {
            var p = rwall[i];
            var r = new Kinetic.Rect({
                width: p[2] - p[0],
                height: p[3] - p[1],
                x: p[0],
                y: p[1],
                fill: cGreen,
            });
            frameLayer.rwall.push(r);
            frameLayer.add(r);
        }

        frameLayer.floorRect = new Kinetic.Rect({
            width: stageWidth - tl.x,
            height: 10,
            x: tl.x,
            y: br.y,
            fill: cDGreen,
        });

        frameLayer.add(frameLayer.floorRect);
        frameLayer.rwall[0].moveToTop();

        var r = new Kinetic.Rect({
            width: stageWidth - tl.x,
            height: br.y - tl.y,
            x: tl.x,
            y: tl.y,
            fill: cLGreen,
        });
        bgLayer.add(r);

        var textCfg = {
            text: "Arrow Keys to move",
            fontFamily: GAME_FONT,
            fontSize: 12,
            textFill: "white",
            x: pStart[0] - 120,
            y: pStart[1] - 80,
        };
        var t = new Kinetic.Text(textCfg);
        bgTextLayer.add(t);

        textCfg.text = "Collect!";
        textCfg.x = cStart[0] - 60;
        textCfg.y = cStart[1] - 60;
        t = new Kinetic.Text(textCfg);
        bgTextLayer.add(t);

        textCfg.text = "Score x2 and Multiplier x2";
        textCfg.x = 170;
        textCfg.y = br.y - 60;
        t = new Kinetic.Text(textCfg);
        bgTextLayer.add(t);

        textCfg.text = "Go! ->";
        textCfg.x = 680;
        textCfg.y = 50;
        t = new Kinetic.Text(textCfg);
        bgLayer.exitText = t;
        t.flash = function() {
            if (t.isVisible()) {
                t.hide();
            } else {
                t.show();
            }
            bgLayer.draw();
            timeouts.push(setTimeout(t.flash, 500));
        };
        bgLayer.add(t);
    }
    
    // Coins
    
    function collideCoin(x1, y1, x2, y2) {
        for (var i = 0; i < coins.length; i++) {
            if (rInRect(coins[i].tlx, coins[i].tly, coins[i].brx, coins[i].bry, x1, y1, x2, y2)) return {coin: coins[i], index: i};
        }
        return null;
    }

    function collideMult(x1, y1, x2, y2) {
        for (var i = 0; i < mults.length; i++) {
            var m = mults[i].getChildren()[0];
            var b = [mults[i].getX() - m.getRadius(), mults[i].getY() - m.getRadius(), mults[i].getX() + m.getRadius(), mults[i].getY() + m.getRadius()];
            if (rInRect(b[0], b[1], b[2], b[3], x1, y1, x2, y2)) return {mult: mults[i], index: i};
        }
        return null;
    }

    function makeCoin() {
        var left = spikes.getEdge() + coinRegionMargin * 2;
        if (!firstDrop) left = stageWidth / 2;
        var right = br.x - coinRegionMargin;
        var tries = 5;
        if (numCoins < coinLimit) {
            do {
                if (!tries--) return;
                var x = Math.floor(Math.random() * (right - left)) + left;
                var y = Math.floor(Math.random() * coinRegionHeight + tl.y + coinRegionMargin);
            } while (collideCoin(x, y, x + coinSize, y + coinSize));
            var c = new Coin(x, y);
            coins.push(c);
            coinLayer.draw();
            numCoins++;
        }
    }

    function Coin(x, y) {
        this.tlx = x - coinSize / 2;
        this.tly = y - coinSize / 2;
        this.brx = x + coinSize / 2;
        this.bry = y + coinSize / 2;
        var r = new Kinetic.Rect({
            width: 0,
            height: 0,
            x: x,
            y: y,
            fill: "yellow",
            offset: [coinSize / 2, coinSize / 2],
        });
    r.spawned = false;
        this.shape = r;
        coinLayer.add(r);
    var pulseSize = 4;
    this.anim = function() {
      r.transitionTo({
        x: x - pulseSize/2,
        y: y - pulseSize/2,
        height: coinSize + pulseSize,
        width: coinSize + pulseSize,
        duration: 0.1,
        callback: function() {
          r.transitionTo({
            x: x,
            y: y,
            height: coinSize,
            width: coinSize,
            duration: 0.1,
          });
        },
      });
    };
        this.shape.transitionTo({
            duration: 1,
            easing: 'elastic-ease-out',
            width: coinSize,
            height: coinSize,
            x: x,
            y: y,
            rotation: Math.PI * 2,
      callback: function() { r.spawned = true; },
        });
        this.destroy = function() {
      var s = new Kinetic.Text({
        width: 100,
        fontFamily: GAME_FONT,
        fontSize: 8,
        text: "+" + worth,
        offset: [50, 0],
        x: this.shape.getX(),
        y: this.shape.getY() - 20,
        align: 'center',
        textFill: "white",
      });
      coinLayer.add(s);
      s.transitionTo({
        duration: 0.6,
        y: this.shape.getY() - 50,
        alpha: 0,
        callback: function() { coinLayer.remove(s) },
      });
            coinLayer.remove(this.shape);
            coinLayer.draw();
        };
    this.explode = function() {
      coinLayer.remove(this.shape);
      for (var j = 0; j < 10; j++) {
        (function() {
          var gib = new Kinetic.Rect({
            width: coinSize/2,
            height: coinSize/2,
            fill: cYellow,
            x: r.getX(),
            y: r.getY() + Math.random() * 20 - 10,
          });
          coinLayer.add(gib);
          gib.moveToBottom();
          gib.transitionTo({
            duration: Math.random() / 2 + 0.2,
            x: r.getX() + Math.random() * 40 + 60,
            //y: r.getY() + Math.random() * 60 - 30,
            alpha: 0,
            callback: function() {
              coinLayer.remove(gib);
            },
          });
        })();
      }      
    }
    }

    function Player() {
        var pSize = 25;
        var tSize = pSize / 2;
        var shape = new Kinetic.Group({
      x: pStart[0],
            y: pStart[1],
    });
    var body = new Kinetic.Rect({
            width: pSize,
            height: pSize,
            fill: "black",
            offset: [pSize / 2, pSize / 2],
        });
    shape.add(body);
    var eye = new Kinetic.Rect({
            x: pSize * 2 / 3,
            y: 6,
            width: pSize / 4,
            height: pSize / 3,
            fill: "white",
            offset: [pSize / 2, pSize / 2],
        });
    shape.add(eye);
    var eyebrow = new Kinetic.Rect({
            x: 12,
            y: 2,
            width: 12,
            height: pSize / 8,
            fill: "white",
            offset: [pSize / 2, pSize / 2],
        });
    shape.add(eyebrow);
    this.setFill = function(c) {
      body.setFill(c)
    };
        this.init = function() {
            playerLayer.add(shape);

            this.colliders = [];
            this.jumped = true;

            for (var i = 0; i < aabb.length; i++) {
                var p = aabb[i];
                this.addCollider({
                    x1: p[0],
                    y1: p[1],
                    x2: p[2],
                    y2: p[3],
                });
            }
            for (var i = 0; i < rwall.length; i++) {
                var p = rwall[i];
                frameLayer.rwall[i].collider = this.addCollider({
                    x1: p[0],
                    y1: p[1],
                    x2: p[2],
                    y2: p[3],
                });
            }

            this.vx = 0;
            this.vy = 0;
            this.shape = shape;
        };

        this.g = 0.01 / 1000 * 60;
        this.maxSpeed = 4 / 1000 * 60;
    this.acceleration = 0.03 / 1000 * 60;
    this.friction = 0.90;


        var tail = true;

        this.stopTail = function() {
            tail = false;
        };
        var continueTail = function() {
            setTimeout(function() {
                if (tail) {
                    makeTail();
                    continueTail();
                }
            }, 100);
        };
        this.startTail = function(x, y) {
            shape.tx = x;
            shape.ty = y;
            tail = true;
            continueTail();
        };


        this.startTail(0, 60);

        var makeTail = function() {
            var tail = new Kinetic.Rect({
                x: shape.getX() - tSize / 2,
                y: shape.getY() - tSize / 2,
                width: tSize,
                height: tSize,
                fill: "red",
            });
            shape.getParent().add(tail);
            tail.moveToBottom();
            tail.transitionTo({
                x: tail.getX() + shape.tx,
                y: tail.getY() + shape.ty,
                width: 0,
                height: 0,
                duration: 0.8,
        alpha: 0,
                callback: function() { 
                    if (tail.getParent()) {
                        tail.getParent().remove(tail);
                    } 
               },
            });
        }


        this.die = function() {
            player.stopTail();
            player.shape.hide();
            if (escaped) score *= 2;
            if (!game_over) {
                saveGame();
                for (var i = 0; i < 80; i++) {
                    (function() {
                        var tail = new Kinetic.Rect({
                            x: shape.getX() + Math.random() * pSize,
                            y: shape.getY() + Math.random() * pSize,
                            width: tSize,
                            height: tSize,
                            fill: "black",
                        });
                        playerLayer.add(tail);
                        tail.transitionTo({
                            x: tail.getX() + Math.random() * 5 * pSize + 2 * pSize,
                            y: tail.getY() + Math.random() * 10 * pSize - 5 * pSize,
                            width: 0,
                            height: 0,
                            duration: 1.5 * Math.random() + 0.2,
                            alpha: 0,
                            callback: function() { playerLayer.remove(tail) },
                        });
                    })();
                }
                timeouts.push(setTimeout(function() {fadeIn(function() {
          deadLayer.moveToTop();
                    deadLayer.bg.setFill("white");
                    if (escaped) {
                        deadLayer.bg.setFill("#0C5DA5");
                        deadPlayerLayer.moveToTop();
                        player.shape.setX(100);
                        player.shape.setY(stageHeight - 100);
                        player.shape.show();
                        player.shape.moveTo(deadPlayerLayer);
                        player.startTail(-40, 60);
                        var small = function() {
                            var x = 2 * Math.random() * stageWidth;
                            var r = new Kinetic.Rect({
                                width: 4,
                                height: 4,
                                fill: cYellow,
                                x: x,
                                y: -10,
                            });
                            deadPlayerLayer.add(r);
                            r.transitionTo({
                                y: stageHeight + 10,
                                x: x - (stageHeight + 20) * 3 / 2,
                                duration: 10 - 4 * Math.random(),
                                callback: function() {
                                    deadPlayerLayer.remove(r);
                                },
                            });
                            timeouts.push(setTimeout(small, 100 + 200 * Math.random()));
                        }
                        var big = function() {
                            var x = 2 * Math.random() * stageWidth;
                            var r = new Kinetic.Rect({
                                width: 100 + 100 * Math.random(),
                                height: 20 + 50 * Math.random(),
                                fill: "grey",
                                x: x,
                                y: -70,
                            });
                            deadLayer.add(r);
                            r.moveDown();
                            r.transitionTo({
                                y: stageHeight + 10,
                                x: x - (stageHeight + 80) * 3 / 2,
                                duration: 20,
                                callback: function() {
                                    deadLayer.remove(r);
                                },
                            });
                            timeouts.push(setTimeout(big, 5000 + 4000 * Math.random()));
                        }
                        small();
                        big();
                    }
                    deadLayer.update();
          fadeLayer.moveToTop();
          fadeOut();
        })}, 1500));
                game_over = true;
            }
        };


        this.move = function(td) {
            if (game_over) return;
            var udlr = [38, 40, 37, 39];
            var pos = this.shape.getPosition();
            if (pos.x > stageWidth + 10) {
                escaped = true;
                this.die();
            }
            if (pos.x - pSize / 2 < spikes.getEdge()) {
                this.die();
            }
            if (!gravity) {
                player.setFill("black");
                this.vx *= this.friction;
                this.vy *= this.friction;//this.vy + this.g * td;
                var a = 0, dx = 0, dy = 0;

                if (keys[udlr[0]]) { 
                   dy = -1; 
                }
                if (keys[udlr[1]]) {
                   dy = 1; 
                }
                if (keys[udlr[2]]) {
                   dx = -1; 
                }
                if (keys[udlr[3]]) {
                   dx = 1; 
                }
                if ((dx || dy) && dist(this.vx, this.vy) <= this.maxSpeed) {
                    a = Math.atan2(dx, dy);
                    this.vx += Math.sin(a) * this.acceleration * td;
                    this.vy += Math.cos(a) * this.acceleration * td;
    //                window.console.log(a + " " + dx + " " + dy + " " + this.vx + " " + this.vy);
                    if (!firstMove) {
                        beginTerror();
                        firstMove = true;
                    }
                }
            } else {
                this.vx *= this.friction;
                this.vy = this.vy + this.g * td;
                if (this.jumping || this.jumped) {
                    player.setFill("#620000");
                } else {
                    player.setFill("black");
                }
                if (keys[udlr[0]] && !this.jumped) { 
                    if (!this.jumping) {
                       this.jumpY = pos.y;
                       console.log(this.jumpY);
                    }
                    this.vy = -0.3;
                    this.jumping = true;
                    var tail = new Kinetic.Rect({
                        x: shape.getX() - tSize / 2,
                        y: shape.getY() - tSize / 2,
                        width: tSize,
                        height: tSize,
                        fill: "red",
                    });
                    playerLayer.add(tail);
                    tail.moveToBottom();
                    tail.transitionTo({
                        x: tail.getX() + Math.random() *  2 * pSize - pSize +  tSize / 2,
                        y: tail.getY() + 60,
                        width: 0,
                        height: 0,
                        duration: 0.6,
                        alpha: 0,
                        callback: function() { playerLayer.remove(tail) },
                    });
                }
                if (this.jumping && (!keys[udlr[0]] || pos.y <= this.jumpY - 25)) {
          this.jumping = false;
                    this.jumped = true;
                }
        if (Math.abs(this.vx) <= this.maxSpeed) {
          if (keys[udlr[2]]) {
             this.vx -= this.acceleration * td; 
          }
          if (keys[udlr[3]]) {
             this.vx += this.acceleration * td; 
          }
        }
                if (this.vy <= this.maxSpeed) {
                    if (keys[udlr[1]]) {
                       this.vy += this.acceleration * td; 
                    }
                }
            }
            var x = pos.x + this.vx * td;
            var y = pos.y + this.vy * td;
            var p = this.collide(pos.x, pos.y, x, y);
            this.shape.setPosition({x: p.x, y: p.y});
            var c = collideCoin(p.x - pSize / 2, p.y - pSize / 2, p.x + pSize / 2, p.y + pSize / 2);
            if (c) {
                if (!firstCollect) {
                    bgTextLayer.transitionTo({
                        duration: 0.6,
                        alpha: 0,
                    });
          firstCollect = true;
                }
                c.coin.destroy();
                coins.splice(c.index, 1);
                score += worth;
                worth++;
                writeScore();
                numCoins--;
            }
            var m = collideMult(p.x - pSize / 2, p.y - pSize / 2, p.x + pSize / 2, p.y + pSize / 2);
            if (m) {
        for (var i = 0; i < 15; i++) {
          (function() {
            var r = new Kinetic.Rect({
              width: coinSize,
              height: coinSize,
              fill: cYellow,
              x: p.x,
              y: p.y,
            });
            playerLayer.add(r);
            r.moveToBottom();
            r.transitionTo({
              duration: Math.random() / 2,
              width: coinSize * 2,
              height: coinSize * 2,
              x: Math.random() * pSize * 4 + p.x - pSize * 2,
              y: Math.random() * pSize * 4 + p.y - pSize * 2,
              alpha: 0,
              callback: function() {
                playerLayer.remove(r);
              },
            });
          })();
        }
        var s = new Kinetic.Text({
          width: 100,
          fontFamily: GAME_FONT,
          fontSize: 8,
          text: "+" + score,
          offset: [50, 0],
          x: this.shape.getX(),
          y: this.shape.getY() - 20,
          align: 'center',
          textFill: "white",
        });
        coinLayer.add(s);
        var end = this.shape.getY() - 70;
        var steps = 20;
        var d = (this.shape.getY() - end) / steps;
        var colors = ["blue", "yellow", "black", "cyan", "magenta", "white"];
        var c = 0;
        var anim = function() {
//          console.log(c);
          if (s.getY() >= end) {
            var a = 1;
            if (s.getY() - end < 20) a = 1 / steps;
            s.setTextFill(colors[c++]);
            if (c >= colors.length) c = 0;
            s.transitionTo({
              duration: 1.5 / steps,
              y: s.getY() - d,
              alpha: a,
              callback: function() { anim() },
            });
          } else {
            coinLayer.remove(s)
          }
        }
        anim();
                playerLayer.remove(m.mult);
                mults.splice(m.index, 1);
                score *= 2;
                worth *= 2;
                writeScore();
            }
        };

        this.getBounds = function(x, y) {
            if (x == 'undefined') {
                x = this.x;
                y = this.y;
            }
            return {
                t: y - pSize / 2,
                b: y + pSize / 2,
                r: x + pSize / 2,
                l: x - pSize / 2,
            };
        };

        this.collide = function(ox, oy, nx, ny) {
            var pos = this.shape.getPosition();

            for (var i = 0; i < this.colliders.length; i++) {
                var c = this.colliders[i];
                if (c.x1 == null) {
                    this.colliders.splice(i--, 1);
                    continue;
                }
                
                var nb = this.getBounds(nx, ny);
                var ob = this.getBounds(ox, oy);
                if (rInRect(nb.l, nb.t, nb.r, nb.b, c.x1, c.y1, c.x2, c.y2)) {
                    //window.console.log(c.x1 + " " + c.y1 + "," + c.x2 + " " + c.y2 + "," + ob.t + ","  + nb.t  + ", " + this.vy);
                    if (ob.r <= c.lx1 && nb.r > c.x1) {
                        nx = c.x1 - pSize / 2;
                        if (this.vx > 0)
                            this.vx *= -0.6;
                        //window.console.log(this.vy + " LEFT " + c.cid);
                    } else if (ob.l >= c.lx2 && nb.l < c.x2) {
                        nx = c.x2 + pSize / 2;
                        if (this.vx < 0)
                            this.vx *= -0.6;
                        //window.console.log(this.vy + " RIGHT " + c.cid);
                    } else if (ob.b <= c.ly1 && nb.b > c.y1) {
                        ny = c.y1 - pSize / 2;
                        if (this.vy > 0)
                            this.vy *= -0.6;
                        this.jumped = false;
                        //window.console.log(this.vy + " ABOVE " + c.cid);
                    } else if (ob.t >= c.ly2 && nb.t < c.y2) {
                        ny = c.y2 + pSize / 2;
                        if (this.vy < 0)
                            this.vy *= -0.6;
                        this.jumping = false;
                        this.jumped = true;
                        //window.console.log(this.vy + " BELOW " + c.cid);
                    }
                }
            }
            return {x: nx, y: ny};
        };

    this.cid = 0;
    
        this.addCollider = function(r) {
            var c = {
        cid: this.cid++,
                x1: r.x1,
                y1: r.y1,
                x2: r.x2,
                y2: r.y2,
                lx1: r.x1,
                ly1: r.y1,
                lx2: r.x2,
                ly2: r.y2,
                set: function(r) {
                    this.lx1 = this.x1;
                    this.ly1 = this.y1;
                    this.lx2 = this.x2;
                    this.ly2 = this.y2;
                    this.x1 = r.x1;
                    this.y1 = r.y1;
                    this.x2 = r.x2;
                    this.y2 = r.y2;
                },
                // TODO remove hack
                remove: function(r) {
                    this.x1 = null;
                },
            };
            this.colliders.push(c);
            return c;
        };

        this.init();

    }

    function spawnBoxes() {
        var boxSize = 50;
        var patterns = [
            [
                [
                    "   X      ",
                    "   X   X  ",
                    "XX   X X  ",
                ],
                [
                    "  X        ",
                    "X   X X  X ",
                    "XX  X   XX ",
                ],
                [
                    "  X       X ",
                    " X    X X X ",
                    "   XX XMX   ",
                ],
            ],
            [
                [
                    "       XX ",
                    "X   X     ",
                    "  X XX X  ",
                    "X X   MX  ",
                ],
                [
                    " X X   ",
                    "     X ",
                    " X  XX  ",
                    "XXM XX  ",
                ],
                [
                    "   X    ",
                    "   XX   ",
                    " X    X ",
                    "XX  X X ",
                ],
            ],
            [
                [
                    "          ",
                    " X    X   ",
                    "X  X  X   ",
                    "X    MX   ",
                ],
                [
                    " X X   ",
                    "     X ",
                    " X  XX  ",
                    "XXM XX  ",
                ],
                [
                    "   X    ",
                    "   XX   ",
                    " X    X ",
                    "XXM X X ",
                ],
            ],
        ];
        var setDist = [-10, 200, 400];
        var set = 0;
        while (spikes.getEdge() > setDist[set++]);
        set -= 2;
        set = Math.max(0, Math.min(set, patterns.length - 1));
        var chosen = patterns[set][Math.floor(Math.random() * patterns[set].length)];
        for (var i = 0; i < chosen.length; i++) {
            for (var j = 0; j < chosen[i].length; j++) {
                if (chosen[i][j] == 'X') {
                    //window.console.log(chosen[i]);
                    var box = new Kinetic.Rect({
                        fill: boxColor, 
                        x: stageWidth + j * boxSize,
                        y: br.y - boxSize * (chosen.length - i),
                        width: boxSize + 1,
                        height: boxSize  + 1,
                    });
                    playerLayer.add(box);
                    box.collider = player.addCollider({
                        x1: box.getX(),
                        y1: box.getY(),
                        x2: box.getX() + box.getWidth(),
                        y2: box.getY() + box.getHeight(),
                    });
                    boxes.push(box);
                } else if (chosen[i][j] == 'M') {
                    //window.console.log(chosen[i]);
                    var mult = makeMult(stageWidth + j * boxSize + boxSize / 2, br.y - boxSize * (chosen.length - i) + boxSize / 2);
                    playerLayer.add(mult);
                    mults.push(mult);
                }
            }
        }
        return chosen[0].length * boxSize;
    }

    function makeMult(x, y) {
        var mult = new Kinetic.Group({
            x: x,
            y: y,
        });
        mult.add(new Kinetic.RegularPolygon({
            fill: "yellow", 
            radius: 15,
            sides: 4,
        }));
        mult.add(new Kinetic.RegularPolygon({
            fill: "red", 
            radius: 8,
            sides: 8,
        }));
        return mult;
    }

  // Colors
  var cDGreen = "#448724";
  var cGreen = "#004B09";
  var cLGreen = "#8FD070";
  var cRed = "#660000";
  var cDRed = "#8C001B";
  var cLRed = "#C5596E";
  var cYellow = "yellow";
    var cBGGreen = "#75C060";
    var cBGRed = "#B05060";
  
    // UI Constants
    var stageWidth = 800;
    var stageHeight = 500;
    var tl = {x: 10, y:10};
    var br = {x: stageWidth - 10, y: stageHeight - 40};
    var pStart = [stageWidth / 4, stageHeight / 2 - 30];
    var cStart = [stageWidth * 3 / 4 - 30, stageHeight / 2 - 30];
    var aabb = [
        [-20, -20, tl.x, stageHeight],
        [tl.x, -20, stageWidth, tl.y],
        [tl.x, br.y, stageWidth, stageHeight + 60],
    ];
    var rwall = [
        [br.x, 50, stageWidth + 30, stageHeight],
        [br.x, 0, stageWidth + 30, 50],
    ];

    // Coins
    var coinSize = 15;
    var coinRegionHeight = 250;
    var numCoins = 0
    var coinLimit = 20;
    var coinRegionMargin = 20;
    coins = [];


    // Globals
    var saveGameKey = "nik3daz:game_dev_a1:hiScore";

    timeouts = [];

    stage = new Kinetic.Stage({
            container : "container",
            width : stageWidth,
            height : stageHeight,
        });
    var debugLayer = new Kinetic.Layer();
    var hudLayer = new Kinetic.Layer();
    var playerLayer = new Kinetic.Layer();
    var deadPlayerLayer = new Kinetic.Layer();
    var fadeLayer = new Kinetic.Layer();
    var coinLayer = new Kinetic.Layer();
    var spikeLayer = new Kinetic.Layer();
  var deadLayer = new Kinetic.Layer();
    var frameLayer = new Kinetic.Layer();
    var bgAnimLayer = new Kinetic.Layer();
    var bgLayer = new Kinetic.Layer();
    bgTextLayer = new Kinetic.Layer();

    boxes = [];
    boxColor = cDGreen;
    spikes = new Spikes();

    firstCollect = false;

    stage.add(deadLayer);
    stage.add(deadPlayerLayer);
    stage.add(fadeLayer);
    stage.add(bgLayer);
    stage.add(bgAnimLayer);
    stage.add(bgTextLayer);
    stage.add(playerLayer);
    stage.add(coinLayer);
    stage.add(spikeLayer);
    stage.add(debugLayer);
    stage.add(frameLayer);
    stage.add(hudLayer);

    patternLength = 10000000;
    gravity = false;
    hiScore = -1;
    player = false;

    function reset() {
        bgLayer.exitText.hide();
        escaped = false;
        rwall_opening = false;
        for (var i = 0; i < frameLayer.rwall.length; i++) {
            frameLayer.rwall[i].setY(rwall[i][1]);
        }
        frameLayer.draw();
    deadLayer.moveToBottom();
        playerLayer.removeChildren();
        spikeLayer.removeChildren();
        coinLayer.removeChildren();
        gravity = false;
        score = 0;
        worth = 1;
        writeScore();
        if (player) {
            player.stopTail();
        }
        deadPlayerLayer.moveToBottom();
        if (escaped) {
            deadPlayerLayer.remove(player.shape);
        }
        deadPlayerLayer.draw();
        coins = [];
        boxes = [];
        mults = [];
        player = new Player();
        patternLength = 10000000;
        firstMove = false;
        firstDrop = false;
        spikes = new Spikes();
        game_over = false;
        if (boxColor != cDGreen) toggleColors();
        for (var x in timeouts) {
            clearTimeout(timeouts[x]);
        }
        timeouts = [];

        numCoins = 0;

        var c = new Coin(cStart[0], cStart[1]);
        coins.push(c);
        numCoins++;

        var m = makeMult(stageWidth / 2, br.y - 20);
        playerLayer.add(m);
        mults.push(m);
    time = 0;

        fadeOut();

        stage.draw();
    }

    // Main
    initLayers();
    score = 0;
    worth = 1;
    loadGame();
    writeScore();
    reset();

    stage.draw();


    // Attach event listeners
    window.addEventListener('keydown', doKeyDown, false);
    window.addEventListener('keyup', doKeyUp, false);
    window.addEventListener('mouseup', doMouseUp, false);


  var boxSpeed = 2.75 / 1000 * 60;
  var time = 0;
    stage.onFrame(function(frame) {
    time += frame.timeDiff;
    var td = 1000 / 60;
    while (time >= td) {
      patternLength -= boxSpeed * td;
      if (patternLength <= 0) {
        patternLength = spawnBoxes();
      }
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        box.setX(box.getX() - boxSpeed * td);
        box.collider.set({
          x1: box.getX(),
          y1: box.getY(),
          x2: box.getX() + box.getWidth(),
          y2: box.getY() + box.getHeight(),
        });
        if (box.getX() < -50) {
          playerLayer.remove(box);
          box.collider.remove();
          boxes.splice(i--, 1);
        }
      }
            if (firstMove) {
                for (var i = 0; i < mults.length; i++) {
                    var mult = mults[i];
                    mult.setRotation(mult.getRotation() + 0.003 * td);
                    mult.setX(mult.getX() - boxSpeed * td);
                    if (mult.getX() < -50) {
                        playerLayer.remove(mult);
                        mults.splice(i--, 1);
                    }
                }
            }
            if (rwall_opening && frameLayer.rwall[1].getY() + frameLayer.rwall[1].getHeight() > tl.y + 3) {
                var moveRwall = function (f, td) {
                    f.setY(f.getY() + 1 / 1000 * 60 * td);
                    f.collider.set({
                        x1: f.getX(),
                        y1: f.getY(),
                        x2: f.getX() + f.getWidth(),
                        y2: f.getY() + f.getHeight(),
                    });
                };
                moveRwall(frameLayer.rwall[0], td);
                moveRwall(frameLayer.rwall[1], -td);
                frameLayer.draw();
            }
      player.move(td);
      playerLayer.draw();
      time -= td;
    }
    });

    stage.start();
  var pulseCoins = function() {
    setTimeout(function() {
      for (var i = 0; i < coins.length; i++) {
        var coin = coins[i];
        if (coin.shape.spawned)
          coin.anim();
      }
      pulseCoins();
    }, 1000);
  };
  pulseCoins();
  
    function flashColors(n, cb) {
        var flashLength = 300;
        if (!cb) cb = function(){};
        var g = function() {
            timeouts.push(setTimeout(function () {
                toggleColors();
                timeouts.push(setTimeout(function () {
                    toggleColors();
                    if (!n--)
                        timeouts.push(setTimeout(cb, flashLength));
                    else
                        g();
                }, flashLength));
            }, flashLength));
        }
        g();
    }

    // Debug
    function writeDebug(message) {
        var context = debugLayer.getContext();
        debugLayer.clear();
        debugLayer.moveToTop();
        context.font = "8pt " + GAME_FONT;
        context.fillStyle = "black";
        context.fillText(message, tileSize * mapMaxX, 25);
    }

    function writeScore() {
        if (score > hiScore) {
            hudLayer.hiScoreText.setText("HI " + scoreString());
            hiScore = score;
        }
        hudLayer.scoreText.setText("SCORE " + scoreString());
        hudLayer.draw();
    }

    function scoreString() {
        var s = '000000000000000000' + score;
        return s.slice(-10) + " x" + worth;
    }


    // Save games

    function saveGame() {
    if (parent.kongregate) {
            parent.kongregate.stats.submit("score", hiScore);
        }
        if (typeof(window.localStorage) != 'undefined') {
            try {
                window.localStorage.setItem(saveGameKey, hudLayer.hiScoreText.getText());
                console.log(saveGameKey, hudLayer.hiScoreText.getText());
            } catch(e) {
            }
        }
    }

    function loadGame() {
        if (typeof(window.localStorage) != 'undefined') {
            hiScoreString = window.localStorage.getItem(saveGameKey);
            if (hiScoreString) {
                console.log(hiScoreString);
                hudLayer.hiScoreText.setText(hiScoreString);
                hiScore = parseInt(hiScoreString.replace(/^[^0-9]* /, "").replace(/ .*$/, ""));
                console.log(hiScore + " " + hiScoreString.replace(/^[^0-9]* /).replace(/ .*$/));
            }
        }
    }

  // Utils
  function dist(x1, y1, x2, y2) {
    if (!x2 && !y2) x2 = y2 = 0;
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }
 
    // Check if point x1, y1 is in rect x2, y2, x3, y3
    function pInRect(x1, y1, x2, y2, x3, y3) {
        return (x1 > x2 && x1 < x3 && y1 > y2 && y1 < y3);
    }

    // Check if square x1, y1 of size s1 intersects square x2, y2 of size s2
    function rInRect(x1, y1, x2, y2, x3, y3, x4, y4) {
        return pInRect(x1, y1, x3, y3, x4, y4) || pInRect(x2, y2, x3, y3, x4, y4) ||
            pInRect(x1, y2, x3, y3, x4, y4) || pInRect(x2, y1, x3, y3, x4, y4);
    }
};
