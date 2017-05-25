function pick(arr, n, m) {
    let arr1 = arr.slice(0, n)
    let arr2 = arr.slice(n, arr.length)
    let sum = arr1.reduce((pre, current) => pre + current, 0)
    while (sum < m) {
        let i
        for (i = 0; i < arr2.length; ++i) {
            let j
            for (j = arr1.length - 1; j >= 0; --j) {
                if (arr2[i] > arr1[j]) {
                    sum += (arr2[i] - arr1[j]);
                    console.log(sum);
                    debugger;
                    [arr1[j], arr2[i]] = [arr2[i], arr1[j]]
                    break;
                }
            }
            if (j >= 0) {
                break;
            }
        }
    }
    if (sum === m) {
        return arr1
    } else {
        return null
    }
}