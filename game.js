class Game {
    constructor() {
        this.boardSize = 9;
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        this.colors = ['red', 'yellow', 'blue', 'green'];
        this.score = 0;
        this.level = 1;
        this.selectedBall = null;
        this.isPaused = false;
        this.nextBalls = this.generateNextBalls(); // 存储下一回合的珠子信息
    }

    // 生成下一回合的珠子信息
    generateNextBalls() {
        const balls = [];
        for (let i = 0; i < 3; i++) {
            balls.push({
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                x: Math.floor(Math.random() * this.boardSize),
                y: Math.floor(Math.random() * this.boardSize)
            });
        }
        return balls;
    }

    // 添加新的珠子
    addNewBalls() {
        let added = 0;
        const newNextBalls = this.generateNextBalls(); // 生成下一回合的珠子
    
        // 尝试放置预设的珠子
        for (const ball of this.nextBalls) {
            if (this.board[ball.y][ball.x] === null) {
                this.board[ball.y][ball.x] = ball.color;
                added++;
            }
        }
    
        // 如果有预设位置被占用，寻找新的空位置放置剩余的珠子
        while (added < 3) {
            const x = Math.floor(Math.random() * this.boardSize);
            const y = Math.floor(Math.random() * this.boardSize);
            if (this.board[y][x] === null) {
                this.board[y][x] = this.nextBalls[added].color;
                added++;
            }
        }
    
        this.nextBalls = newNextBalls; // 更新下一回合的珠子信息
    }

    // 初始化游戏
    init() {
        this.board = Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(null));
        this.score = 0;
        this.level = 1;
        this.nextBalls = this.generateNextBalls(); // 初始化下一回合的珠子
        this.addNewBalls();
    }



    // 检查是否可以移动到目标位置
    canMove(fromX, fromY, toX, toY) {
        if (this.board[toY][toX] !== null) return false;
        
        // 使用广度优先搜索检查路径
        const queue = [[fromX, fromY]];
        const visited = new Set();
        visited.add(`${fromX},${fromY}`);

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            if (x === toX && y === toY) return true;

            // 检查四个方向
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            for (const [dx, dy] of directions) {
                const newX = x + dx;
                const newY = y + dy;
                const key = `${newX},${newY}`;

                if (newX >= 0 && newX < this.boardSize &&
                    newY >= 0 && newY < this.boardSize &&
                    this.board[newY][newX] === null &&
                    !visited.has(key)) {
                    queue.push([newX, newY]);
                    visited.add(key);
                }
            }
        }
        return false;
    }

    // 移动珠子
    moveBall(fromX, fromY, toX, toY) {
        if (!this.canMove(fromX, fromY, toX, toY)) return false;
        
        this.board[toY][toX] = this.board[fromY][fromX];
        this.board[fromY][fromX] = null;
        return true;
    }

    // 检查是否有可消除的珠子
    // 安全访问棋盘格子
    safeGetCell(y, x) {
        if (y < 0 || y >= this.boardSize || x < 0 || x >= this.boardSize) return null;
        return this.board[y][x];
    }

    checkLines() {
        const lines = [];
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 右下对角线
            [1, -1]   // 左下对角线
        ];

        // 遍历棋盘每个单元格
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const currentColor = this.safeGetCell(y, x);
                if (!currentColor) continue;

                // 对四个方向进行检测
                directions.forEach(([dy, dx]) => {
                    // 边界预检：剩余空间是否足够形成五连珠
                    if (y + 4*dy >= this.boardSize || x + 4*dx >= this.boardSize || 
                        y + 4*dy < 0 || x + 4*dx < 0) return;

                    // 连续检测
                    let count = 1;
                    let line = [[x, y]];
                    
                    for (let step = 1; step <= 4; step++) {
                        const nextY = y + dy*step;
                        const nextX = x + dx*step;
                        const nextColor = this.safeGetCell(nextY, nextX);
                        
                        if (nextColor === currentColor) {
                            count++;
                            line.push([nextX, nextY]);
                        } else {
                            break;
                        }
                    }

                    // 发现五连珠时记录
                    if (count >= 5) {
                        lines.push(line);
                    }
                });
            }
        }

        return lines;
    }

    // 消除珠子并计算分数
    removeBalls(lines) {
        let totalRemoved = 0;
        for (const line of lines) {
            for (const [x, y] of line) {
                this.board[y][x] = null;
                totalRemoved++;
            }
        }

        // 计算分数
        if (totalRemoved >= 7) {
            this.score += 1000;
        } else if (totalRemoved >= 6) {
            this.score += 700;
        } else if (totalRemoved >= 5) {
            this.score += 500;
        }

        // 更新等级
        this.level = Math.floor(this.score / 1000) + 1;
    }

    // 检查游戏是否结束
    isGameOver() {
        let emptySpaces = 0;
        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[y][x] === null) emptySpaces++;
            }
        }
        return emptySpaces < 3;
    }

    // 暂停游戏
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    // 重置游戏
    reset() {
        this.init();
        this.isPaused = false;
    }
}