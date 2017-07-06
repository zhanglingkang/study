function pick(arr, n, m) {
    if (n === 1) {
        for (let i = 0; i < arr.length; ++i) {
            if (m === arr[i]) {
                return [arr[i]]
            } else {
                return null
            }
        }
    }
    let result = null
    for (let i = 0; i < arr.length; ++i) {
        let rest = pick([...arr.slice(0, i), ...arr.slice(i + 1, arr.length - 1)], n - 1, m - arr[i])
        if (rest) {
            result = rest.concat(arr[i])
            break;
        }

    }

    return result;

}

function pick1(arr, l, m) {
    let f = {}
    f[l] = f[l] || {}
    if (m < 0) {
        return []
    }
    if (m === 0) {
        return [[]]
    }
    if (l === 1) {
        if (arr[0] === m) {
            return [
                [arr[0]]
            ]
        } else {
            return []
        }
    }
    f[l][m] = [
        ...pick1(arr, l - 1, m),
        ...pick1(arr, l - 1, m - arr[l - 1]).map((item)=> {
            return [
                ...item,
                arr[l - 1]
            ]
        })
    ]
    return f[l][m]

}