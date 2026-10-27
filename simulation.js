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
    constructor(width, height, canvas, heroStage) {
        this.width = width;
        this.height = height;
        this.grid = new Array(height * width).fill(null).map(() => new Cell(0));
        this.canvas = canvas;
        this.heroStage = heroStage;
        canvas.width = width;
        canvas.height = height;
        this.bitmap = new ImageData(width, height);

        heroStage.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
            const y = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));
            this.SetMaterialCircle(x, y, 1, 5);
        });
    }

    static materialData = {
        0: { name: 'Empty', color: '#00000000', updates: false },
        1: { name: 'Sand', color: '#ffff00', updates: true },
        2: { name: 'Water', color: '#0000ff', updates: true, flows: true },
        3: { name: 'Lava', color: '#ff0000', updates: true, flows: true },
        4: { name: 'Ash', color: '#808080', updates: true },
        5: { name: 'Smoke', color: '#808080', updates: true, flows: true },
        6: { name: 'Stone', color: '#808080', updates: false },
        7: { name: 'Solid', color: '#00000000', updates: false },
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

    SetMaterialCircle(x, y, type, radius) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (!this.isInBounds(x + dx, y + dy)) continue;
                if (this.getCell(x + dx, y + dy).type !== 0) continue;

                if (dx * dx + dy * dy <= radius * radius) {
                    this.setMaterial(x + dx, y + dy, type);
                }
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

                if (material.updates) {
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
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let cell = this.getCell(x, y);
                if (cell.type === 0) {
                    
                }

                const color = Simulation.materialData[cell.type].color;
                this.bitmap.data[(y * this.width + x) * 4] = parseInt(color.slice(1, 3), 16); // R
                this.bitmap.data[(y * this.width + x) * 4 + 1] = parseInt(color.slice(3, 5), 16); // G
                this.bitmap.data[(y * this.width + x) * 4 + 2] = parseInt(color.slice(5, 7), 16); // B
                this.bitmap.data[(y * this.width + x) * 4 + 3] = 255; // A
            }
        }

        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.putImageData(this.bitmap, 0, 0);
    }
}
