// https://zhuanlan.zhihu.com/p/364137955
const lines = require('fs').readFileSync('./raw.txt', 'utf8').split('\n')

let prefix
for (let s of lines) {
    s = s.trim()
    if (!s) continue

    if (~s.indexOf('•')) {
        const items = s.split('•')
        let cnt = 0
        for (let item of items) {
            item = item.trim()
            if (item[0] !== '【') continue

            const a = item.indexOf('【')
            const b = item.indexOf('】')
            cnt++

            const level = +item.slice(a + 1, b)
            const label = item.slice(b + 1)
            console.log(`{ id: ${prefix.join('.')}.${cnt}, label: '${label}', level: ${level} }`)
        }
    } else if (~s.indexOf('【')) {
        // i.e. 5.【9】可持久化数据结构
        const item = s
        const a = item.indexOf('【')
        const b = item.indexOf('】')
        const cnt = s.slice(0, a).trim()
        appendOrReplacePrefix(cnt)

        const level = +item.slice(a + 1, b)
        const label = item.slice(b + 1)
        console.log(`{ id: ${prefix.join('.')}, label: '${label}', level: ${level} }`)
    } else {
        let [left, right] = s.split(' ')
        if (/\d$/.test(left)) {
            // i.e. 2.2.4 数学
            prefix = [left]
        } else {
            // i.e. 9. 运筹学
            appendOrReplacePrefix(left)
        }
        console.log(`{ id: ${prefix.join('.') }, label: '${right}' }`)
    }
}

function appendOrReplacePrefix(left) {
    left = left.slice(0, left.length - 1)
    if (left === '1') {
        prefix.push(left)
    } else {
        prefix[prefix.length - 1] = left
    }
}
