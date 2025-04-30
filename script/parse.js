// https://zhuanlan.zhihu.com/p/364137955
const path = require('path')
const lines = require('fs').readFileSync(path.join(__dirname, './raw.txt'), 'utf8').split('\n')

let prefix, dotCnt
const nodes = [], combos = []
for (let s of lines) {
    s = s.trim()
    if (!s) continue

    if (~s.indexOf('•')) {
        const items = s.split('•')
        for (let item of items) {
            item = item.trim()
            if (item[0] !== '【') continue

            const a = item.indexOf('【')
            const b = item.indexOf('】')
            dotCnt++

            const level = +item.slice(a + 1, b)
            const label = item.slice(b + 1)
            saveNodeOrCombo({
                id: prefix.join('.') + '.' + dotCnt,
                label,
                data: {
                    level,
                },
            })
        }
    } else if (~s.indexOf('【')) {
        dotCnt = 0
        // i.e. 5.【9】可持久化数据结构
        const item = s
        const a = item.indexOf('【')
        const b = item.indexOf('】')
        const cnt = s.slice(0, a).trim()
        appendOrReplacePrefix(cnt)

        const level = +item.slice(a + 1, b)
        const label = item.slice(b + 1)
        saveNodeOrCombo({
            id: prefix.join('.'),
            label,
            data: {
                level,
            },
        })
    } else {
        dotCnt = 0

        let [left, right] = s.split(' ')
        if (/\d$/.test(left)) {
            // i.e. 2.2.4 数学
            prefix = [left]
        } else {
            // i.e. 9. 运筹学
            appendOrReplacePrefix(left)
        }
        saveNodeOrCombo({
            id: prefix.join('.'),
            label: right,
        })
    }
}
saveNodeOrCombo({
    id: '2',
})

const result = [
    'const data =',
    JSON.stringify({
        nodes,
        combos,
    }, null, 4),
]
console.log(result.join('\n'))

function appendOrReplacePrefix(left) {
    left = left.slice(0, left.length - 1)
    if (left === '1') {
        prefix.push(left)
    } else {
        prefix[prefix.length - 1] = left
    }
}
function saveNodeOrCombo(o) {
    const parts = o.id.split('.')
    if (parts.length > 1) {
        // parts.pop()
        // o.combo = parts.join('.')
    }

    if (o.data && o.data.level) {
        nodes.push(o)
    } else {
        // use as group nodes
        combos.push(o)
    }
}
