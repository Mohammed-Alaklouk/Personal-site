class Simulation {
    constructor(width, height, canvas) {
        this.width = width;
        this.height = height;
        this.grid = new Array(height * width).fill(0);
        this.canvas = canvas;

        console.log(`Simulation created with width: ${width}, height: ${height}`);
    }

    static materialData = {
        0: { name: 'Empty', color: 'white', updates: false },
        1: { name: 'Sand', color: 'yellow', updates: true },
    };

    getIndex(x, y) {
        return y * this.width + x;
    }

    getCell(x, y) {
        return this.grid[this.getIndex(x, y)];
    }

    setCell(x, y, value) {
        this.grid[this.getIndex(x, y)] = value;
    }

    Update() {
        console.log('Updating simulation...');
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.getCell(x, y);
                if (!Simulation.materialData[cell].updates) continue; 
                if (cell === 1) {
                    // Move down if possible
                    if (y < this.height - 1 && this.getCell(x, y + 1) === 0) {
                        this.setCell(x, y, 0);
                        this.setCell(x, y + 1, 1);
                        continue;
                    } 
                    else if (this.getCell(x + 1, y + 1) === 0) {
                        this.setCell(x, y, 0);
                        this.setCell(x + 1, y + 1, 1);
                        continue;
                    } 
                    else if (this.getCell(x - 1, y + 1) === 0) {
                        this.setCell(x, y, 0);
                        this.setCell(x - 1, y + 1, 1);
                        continue;
                    }
                }
            }
        }
    }

    Draw() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.getCell(x, y);
                ctx.fillStyle = Simulation.materialData[cell].color;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}
