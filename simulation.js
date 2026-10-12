class Cell {
    constructor(type) {
        this.type = type;
        this.isProcessed = false;
    }

    isEmpty() {
        return this.type === 0;
    }
}

class Simulation {
    constructor(width, height, canvas) {
        this.width = width;
        this.height = height;
        this.grid = new Array(height * width).fill(null).map(() => new Cell(0));
        this.canvas = canvas;
        canvas.width = width;
        canvas.height = height;
    }

    static materialData = {
        0: { name: 'Empty', color: 'white', updates: false },
        1: { name: 'Sand', color: 'yellow', updates: true },
        2: { name: 'Water', color: 'blue', updates: true, flows: true },
        3: { name: 'Lava', color: 'red', updates: true, flows: true },
        4: { name: 'Ash', color: 'gray', updates: true },
        5: { name: 'Smoke', color: 'gray', updates: true, flows: true },
    };

    getIndex(x, y) {
        return y * this.width + x;
    }

    getCell(x, y) {
        return this.grid[this.getIndex(x, y)];
    }

    setMaterial(x, y, type) {
        this.grid[this.getIndex(x, y)].type = type;
        this.grid[this.getIndex(x, y)].isProcessed = true;
    }

    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    ResetProcessedFlags() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.getCell(x, y);
                cell.isProcessed = false;
            }
        }
    }

    Update() {
        for (let y = this.height - 1; y >= 0; y--) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.getCell(x, y);
                const type = cell.type;
                const material = Simulation.materialData[cell.type];
                if (type === 0 || cell.isProcessed) continue;


                if (type !== 5) {
                    // Move down if possible
                    if (this.isInBounds(x, y + 1) && this.getCell(x, y + 1).isEmpty()) {
                        this.setMaterial(x, y, 0);
                        this.setMaterial(x, y + 1, type);
                        continue;
                    } 
                    if (this.isInBounds(x + 1, y + 1) && this.getCell(x + 1, y + 1).isEmpty()) {
                        this.setMaterial(x, y, 0);
                        this.setMaterial(x + 1, y + 1, type);
                        continue;
                    } 
                    else if (this.isInBounds(x - 1, y + 1) && this.getCell(x - 1, y + 1).isEmpty()) {
                        this.setMaterial(x, y, 0);
                        this.setMaterial(x - 1, y + 1, type);
                        continue;
                    }
                }

                if (material.flows) {
                    if (this.isInBounds(x + 1, y) && this.getCell(x + 1, y).isEmpty()) {
                        this.setMaterial(x, y, 0);
                        this.setMaterial(x + 1, y, type); 
                    } 
                    else if (this.isInBounds(x - 1, y) && this.getCell(x - 1, y).isEmpty()) {
                        this.setMaterial(x, y, 0);
                        this.setMaterial(x - 1, y, type);
                    }
                }
            }
        }

        this.ResetProcessedFlags();
    }

    Draw() {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.getCell(x, y);
                ctx.fillStyle = Simulation.materialData[cell.type].color;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}
