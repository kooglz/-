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
    checkLines() {
        const lines = [];
        
        // 检查水平线
        for (let y = 0; y < this.boardSize; y++) {
            let count = 1;
            let color = this.board[y][0];
            let line = [[0, y]];
            
            for (let x = 1; x < this.boardSize; x++) {
                if (this.board[y][x] === color && color !== null) {
                    count++;
                    line.push([x, y]);
                } else {
                    if (count >= 5) lines.push(line);
                    count = 1;
                    color = this.board[y][x];
                    line = [[x, y]];
                }
            }
            if (count >= 5) lines.push(line);
        }

        // 检查垂直线
        for (let x = 0; x < this.boardSize; x++) {
            let count = 1;
            let color = this.board[0][x];
            let line = [[x, 0]];
            
            for (let y = 1; y < this.boardSize; y++) {
                if (this.board[y][x] === color && color !== null) {
                    count++;
                    line.push([x, y]);
                } else {
                    if (count >= 5) lines.push(line);
                    count = 1;
                    color = this.board[y][x];
                    line = [[x, y]];
                }
            }
            if (count >= 5) lines.push(line);
        }

        // 检查左上到右下对角线
        for (let startY = 0; startY < this.boardSize; startY++) {
            for (let startX = 0; startX < this.boardSize; startX++) {
                let count = 1;
                let color = this.board[startY][startX];
                let line = [[startX, startY]];
                
                // 沿右下方向遍历
                for (let i = 1; startX + i < this.boardSize && startY + i < this.boardSize; i++) {
                    const currentColor = this.board[startY + i][startX + i];
                    if (currentColor === color && color !== null) {
                        count++;
                        line.push([startX + i, startY + i]);
                    } else {
                        if (count >= 5) lines.push(line);
                        break; // 颜色中断，跳出循环
                    }
                }
                if (count >= 5) lines.push(line);
            }
        }

        // 检查右上到左下对角线
        for (let startY = 0; startY < this.boardSize; startY++) {
            for (let startX = 0; startX < this.boardSize; startX++) {
                let count = 1;
                let color = this.board[startY][startX];
                let line = [[startX, startY]];
                
                // 沿左下方向遍历
                for (let i = 1; startX - i >= 0 && startY + i < this.boardSize; i++) {
                    const currentColor = this.board[startY + i][startX - i];
                    if (currentColor === color && color !== null) {
                        count++;
                        line.push([startX - i, startY + i]);
                    } else {
                        if (count >= 5) lines.push(line);
                        break; // 颜色中断，跳出循环
                    }
                }
                if (count >= 5) lines.push(line);
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