class IncrementalMerkleTree {
    public treeLevels: number
    public root: string
    public zeros: string[] = []
    public filledSubtrees: string[] = []
    public nextLeafIndex = 0

    constructor(
        _treeLevels: number,
        _zeroValue: number,
        _zerothLeaf?: number
    ) {
        this.treeLevels = _treeLevels

        if (_zerothLeaf) {
            this.zeros.push(_zeroValue.toString())
            this.filledSubtrees.push(_zerothLeaf.toString())

            let r = _zeroValue.toString()

            for (let i = 1; i < _treeLevels; i++) {
                // Two hashes per level
                this.zeros.push(this.hash(this.zeros[i-1], this.zeros[i-1]))
                const c = this.hash(this.filledSubtrees[i-1], this.zeros[i-1])
                this.filledSubtrees.push(c)
                r = this.hash(r, r)
            }
            this.root = this.hash(this.filledSubtrees[this.filledSubtrees.length - 1], r)

        } else {
            this.zeros.push(_zeroValue.toString())
            this.filledSubtrees.push('')

            let currentZero = _zeroValue.toString()
            for (let i = 1; i < _treeLevels; i++) {
                // One hash per level
                const hashed = this.hash(currentZero, currentZero)
                this.zeros.push(hashed)

                this.filledSubtrees.push(hashed)
                currentZero = hashed
            }
            this.root = this.hash(currentZero, currentZero)
        }
    }

    public insertLeaf(_leaf: number) {
        let curr = this.nextLeafIndex
        let h = _leaf.toString()
        let left: string
        let right: string

        for (let i = 0; i < this.treeLevels; i ++) {
            if (curr % 2 === 0) {
                left = h
                right = this.zeros[i]
                this.filledSubtrees[i] = h
            } else {
                left = this.filledSubtrees[i]
                right = h
            }
            h = this.hash(left, right)
            curr = Math.floor(curr / 2)
        }
        this.root = h.toString()
        this.nextLeafIndex ++
    }

    public hash(_left: any, _right: any) {
        return `(${_left.toString()}, ${_right.toString()}) `
    }
}

describe('Incremental Merkle tree which inserts a zeroth leaf upon construction', () => {

    it('the constructor without a zeroth leaf should work correctly', async () => {
        const tree = new IncrementalMerkleTree(4, 0)
        console.log(tree.root)

        tree.insertLeaf(123)
        console.log(tree.root)
    })

    it('should insert a zeroth leaf correctly', async () => {
        const tree = new IncrementalMerkleTree(4, 0, 123)
        console.log(tree.root)
    })
})
