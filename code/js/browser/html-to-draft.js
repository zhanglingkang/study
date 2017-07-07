import Immutable from 'immutable'
import $  from 'jquery'
let {
    convertFromHTML,
    ContentState,
    EditorState,
    convertToRaw,
    genKey,
    CharacterMetadata,
    Entity,
    ContentBlock
} = require('draft-js')

const {List} = Immutable
import exportToHTML from '../export-to-html'
import exportToRaw from '../export-to-raw'
import createEditorState from '../model/content'
const languageList = {
    'java': 'Java',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'c': 'C',
    'oc': 'Objective-C',
    'swift': 'Swift',
    'html': 'HTML',
    'xml': 'XML',
    'css': 'CSS'
}
let globalMeta = {}
let rawConvertFromHTML = convertFromHTML
convertFromHTML = function (...args) {
    return rawConvertFromHTML.apply(null, args).contentBlocks
}

function getBlocks(html, meta) {
    let $root = $(`<div id="__root">${html}</div>`);
    let blocksFromHTML = []
    let $children = $root.children()
    for (let i = 0; i < $children.length; ++i) {
        $children.eq(i).each(function () {
            if ($(this).hasClass('md-demo-code-wrapper')) {
                blocksFromHTML.push(importFromDemoCenter($(this)))
            } else if ($(this).hasClass('table-container')) {
                let $table = $(this).find('table')
                if ($table.length) {
                    blocksFromHTML = blocksFromHTML.concat(importFromTable($table))
                }
            } else if (this.nodeName === 'P') {
                if ($(this).find('.left_60p').length) {
                    let $right = $(this).siblings("p:has('.right_40p')")
                    let $middle = $(this).nextUntil("p:has('.right_40p')")
                    blocksFromHTML = blocksFromHTML.concat(importFromTry($(this), $middle, $right))
                    i += ($middle.length + 1)
                } else {
                    blocksFromHTML = blocksFromHTML.concat(importFromP($(this), meta))
                }
            } else if (this.nodeName === 'DIV' && $(this).hasClass('lbs_tab_content')) {
                let $oc = $(this)
                let $swift = $(this).next()
                blocksFromHTML = blocksFromHTML.concat(importFromTab($oc, $swift))
                i += 1
            } else if (this.nodeName === 'DIV' && $(this).hasClass('md-tabs')) {
                blocksFromHTML = blocksFromHTML.concat(importFromMDTab($(this)))
            } else if (this.nodeName === 'PRE') {
                blocksFromHTML.push(importFromPre($(this)))
            } else if (this.nodeName === 'H2') {
                blocksFromHTML.push(importFromH2($(this)))
            } else if (this.nodeName === 'TABLE') {
                blocksFromHTML = blocksFromHTML.concat(importFromTable($(this)))
            } else if (this.nodeName === 'DIV' || this.nodeName === 'IFRAME') {
                if ($(this).hasClass('slide-wrapper')) {
                    let $table = $(this).find('table')
                    if ($table.length > 0) {
                        blocksFromHTML = blocksFromHTML.concat(importFromTable($table))
                    }
                } else {
                    blocksFromHTML.push(importFromRawHTML($(this)))
                }
            } else if (this.nodeName === 'CODE') {
                blocksFromHTML.push(importFromCode($(this)))
            } else if (this.nodeName === 'STRONG') {
                blocksFromHTML = blocksFromHTML.concat(getBlocks($(this).html(), meta))
            } else if (this.nodeName === 'IMG') {
                blocksFromHTML.push(importFromImg($(this)))
            } else {
                if ($(this).hasClass('contact_ul')) {
                    blocksFromHTML.push(importFromRawHTML($(this)))
                }
                blocksFromHTML = blocksFromHTML.concat(convertFromHTML($(this)[0].outerHTML))
            }
        })
    }
    if ($children.length == 0 && html) {
        blocksFromHTML = blocksFromHTML.concat(convertFromHTML(html))
    }
    return blocksFromHTML
}
export default function importFromHTML(html, meta, print) {
    let $html = $(html)
    $html.find('a').each(function () {
        if ($(this).text() === '亲手试一试') {
            $(this).attr('target', '_blank')
            $(this).attr('href', $(this).attr('href').replace(/^http:\/\/lbs.amap.com/, ''))
            $(this).addClass('try')
        }
    })
    html = $('<div></div>').append($html).html()
    html = html.replace(/\[jsdemo_loader\]([^"]+)/, function ($0, $1) {
        return `/fn/jsdemo_loader/?url=${encodeURIComponent($1)}`
    })
    html = html.replace(/(<a[^>]*href="(?!http))([^"]+"[^>]*>)/g, '$1http://replace.lbs.amap.com/$2')
    let blocks = getBlocks(html, meta)

    if (blocks.length) {
        let characterList = List('-'.split('').map(function () {
            return CharacterMetadata.create({
                entity: null
            })
        }))
        if (blocks[blocks.length - 1].getType() === 'atomic') {
            blocks.push(new ContentBlock({
                key: genKey(),
                type: 'unstyled',
                depth: 0,
                text: ' ',
                characterList
            }))
        }
        const contentState = ContentState.createFromBlockArray(blocks);
        let rawContentSTate = convertToRaw(contentState)
        let editorState = createEditorState(rawContentSTate)
        if (print) {
            let html = exportToHTML(editorState)
            console.log(html)
            // document.body.innerHTML = html
            console.log(exportToRaw(editorState))
        }
        return editorState
    } else {
        return createEditorState()
    }
    // $(document.body).append(exportToHTML(editorState))

}
function importFromTab($oc, $swift) {

    let entityKey = Entity.create('code-tab', '"IMMUTABLE"', {
        codeTabData: {
            tabType: 'simple',
            tabs: [
                {
                    title: 'Objective-C',
                    content: getCodeText($oc.find('pre'))
                },
                {
                    title: 'Swift',
                    content: getCodeText($swift.find('pre'))
                }
            ]
        }
    })
    let characterList = List('-'.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    return [new ContentBlock({
        key: genKey(),
        type: 'atomic',
        depth: 0,
        text: '-',
        characterList
    })]
}
function importFromTry($left, $middle, $right) {
    let middleHTML = $('<div></div>').append($middle).html()
    let leftEditorState = importFromHTML(middleHTML)
    $right.children().first().remove()
    let rightHTML = $right.html()
    let rightEditorState = importFromHTML(rightHTML)
    console.log(exportToRaw(rightEditorState))
    let entityKey = Entity.create('layout', '"IMMUTABLE"', {
        layoutData: {
            scale: 6,
            leftEditorState,
            rightEditorState
        }
    })
    let characterList = List('-'.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    return new ContentBlock({
        key: genKey(),
        type: 'atomic',
        depth: 0,
        text: '-',
        characterList
    })
}

function importFromH2($h2) {
    let id = $h2.attr('id')
    let anchor = id && id.split(':')[1]
    if (!anchor) {
        anchor = ''
    }
    let text = $h2.text()
    let entityKey = Entity.create('h2', 'MUTABLE', {
        data: {
            anchor
        }
    })
    let characterList = List(text.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    return new ContentBlock({
        key: genKey(),
        type: 'header-two',
        depth: 0,
        text,
        characterList
    })
}

function importFromCode($code) {
    return importFromRawHTML($code)
}
function escapeHTML(text) {
    text = text || ''
    return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')

}
function getCodeText($pre) {
    let $code = $pre.find('code')
    if (!$code.length) {
        $code = $pre
    }
    let text = $code.html()
    text = escapeHTML(text)
    let spaceCount = 0
    let spaceChar = ''
    let textWithoutBlankLine = text.replace(/^ *\n/gm, '')
    for (let i = 0; i < textWithoutBlankLine.length; ++i) {
        if (textWithoutBlankLine[i] === ' ') {
            spaceCount++
            spaceChar += ' '
        } else {
            break
        }
    }
    text = text.split('\n').map((line) => {
        return line.replace(spaceChar, '')
    }).join('\n')
    return text
}
function getLanguageType(text) {
    let result = ''
    let map = {
        'XML': ['xml'],
        'Java': ['package', '@Override'],
        'Objective-C': ['#import', 'BOOL', '(void)', '@interface', 'nil'],
        'C Sharp': ['private void', 'System.Windows'],
        // 'Swift': ['func'],
    }
    Object.keys(map).some((item) => {
        return map[item].some((keyword) => {
            if (text.indexOf(keyword) !== -1) {
                result = item
                return true
            }
        })
    })
    return result

}
function importFromPre($pre) {
    let className = $pre.attr('class') || ''

    let text = getCodeText($pre)

    // text = text.replace('<br>', '\n')

    let title = getLanguageType(text)
    if (!title) {
        className.split(' ').some((item) => {
            item = item.replace('brush:', '')
            if (languageList[item]) {
                title = languageList[item]
                return true
            }
        })
    }
    if (title) {
        title = title.trim()
    }
    if (title && (title === 'c' || title === 'C')) {
        title = 'Objective-C'
    }
    // let $code = $pre.find('code')
    // if (!$code.length) {
    //     $code = $pre
    // }
    // let text = $code.html()
    //
    // text = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g,
    // '&').replace(/&quot;/g, '"') let spaceCount = 0 let spaceChar = '' let textWithoutBlankLine = text.replace(/^
    // *\n/gm, '') for (let i = 0; i < textWithoutBlankLine.length; ++i) { if (textWithoutBlankLine[i] === ' ') {
    // spaceCount++ spaceChar += ' ' } else { break } } text = text.split('\n').map((line)=> { return
    // line.replace(spaceChar, '') }).join('\n')
    if (!title) {
        let characterList = List(text.split('').map(function () {
            return CharacterMetadata.create({
                entity: null
            })
        }))
        return new ContentBlock({
            key: genKey(),
            type: 'block-code',
            depth: 0,
            text,
            characterList
        })
    }
    // if (!title) {
    //     title = languageList['html']
    // }
    let entityKey = Entity.create('code-tab', '"IMMUTABLE"', {
        codeTabData: {
            tabType: 'simple',
            tabs: [
                {
                    title,
                    content: text
                }
            ]
        }
    })
    let characterList = List('-'.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    return new ContentBlock({
        key: genKey(),
        type: 'atomic',
        depth: 0,
        text: '-',
        characterList
    })
}
function importFromDemoCenter($div) {
    let tabs = []
    $div.find('.md-demo-code-header a').each(function (i,) {
        tabs.push({
            title: $(this).text().trim(),
            content: getCodeText($div.find('.md-demo-code-content-item pre').eq(i))
        })
    })
    let entityKey = Entity.create('code-tab', '"IMMUTABLE"', {
        codeTabData: {
            tabType: 'simple',
            tabs
        }
    })
    let characterList = List('-'.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    return new ContentBlock({
        key: genKey(),
        type: 'atomic',
        depth: 0,
        text: '-',
        characterList
    })

}
function importFromP($p, meta) {
    let html = $p[0].outerHTML
    html = html.replace(/<br *\/?>/g, '</p><p>')
    html = html.replace(/(<img[^>]*\/?>)/g, '</p>$1<p>')
    html = html.replace(/(<a[^>]*>.*?<img.*?<\/a>)/g, '</p>$1<p>')
    html = html.replace(/(<a[^>]*>) *<\/p>(.*?)<p> *(<\/a>)/g, '$1$2$3')
    let blocks = []
    $(html).each(function () {
        if ($(this)[0].nodeName === 'P') {
            if ($(this).html().trim()) {
                blocks = blocks.concat(importFromSingleP($(this), meta))
            }
        } else if ($(this)[0].nodeName === 'IMG') {
            blocks.push(importFromImg($(this)))
        } else if ($(this)[0].nodeName === 'A') {
            if ($(this).find('img').length) {
                blocks.push(importFromImg($(this)))
            } else {
                debugger
            }
        } else if ($(this)[0].nodeName === 'STRONG') {
            if ($(this).find('img').length) {
                blocks.push(importFromImg($(this).find('img')))
            } else {
                debugger
            }
        } else {
            debugger
        }
    })
    return blocks
}
function importFromSingleP($p, meta) {
    let html = $p.html()
    let blocks = []
    if (html.trim() === '===process===') {
        blocks = importFromProcess()
    } else if (html.trim() === '===js===') {
        let list
        let phoneType = meta.summary_phone_type ? meta.summary_phone_type[0] : 'iphone'
        let contentList
        try {
            list = JSON.parse(meta.summary_subway ? meta.summary_subway[0] : meta.summary_phone[0])
            contentList = JSON.parse(meta.summary_code[0])
        } catch (e) {
            blocks = []
            return []
        }
        let entityKey = Entity.create('code-tab', '"IMMUTABLE"', {
            codeTabData: {
                phoneType,
                tabType: 'vertical',
                mediaType: 'video',
                tabs: list.map((item, i) => {
                    return {
                        title: item.title,
                        video: item.src,
                        content: escapeHTML(contentList[i])
                    }
                }),
            }
        })
        let characterList = List('-'.split('').map(function () {
            return CharacterMetadata.create({
                entity: entityKey
            })
        }))
        let buttonText = '下载完整示例代码'
        let buttonEntityKey = Entity.create('button', 'MUTABLE', {
            data: {
                newPage: meta.summary_phone_type,
                type: 'white',
                url: meta.more_url,
                width: 180,
                height: 40,
                class: 'iconfont btn-download-icon'
            }
        })
        let buttonCharacterList = List(buttonText.split('').map(function () {
            return CharacterMetadata.create({
                entity: buttonEntityKey
            })
        }))
        let buttonBlock = new ContentBlock({
            key: genKey(),
            type: 'unstyled',
            depth: 0,
            text: buttonText,
            characterList: buttonCharacterList
        })
        let h2EntityKey = Entity.create('h2', 'MUTABLE', {
            data: {
                anchor: ''
            }
        })
        let h2Text = '功能介绍与体验'
        let h2CharacterList = List(h2Text.split('').map(function () {
            return CharacterMetadata.create({
                entity: h2EntityKey
            })
        }))
        let h2Block = new ContentBlock({
            key: genKey(),
            type: 'header-two',
            depth: 0,
            text: h2Text,
            characterList: h2CharacterList
        })
        blocks = [
            h2Block,
            new ContentBlock({
                key: genKey(),
                type: 'atomic',
                depth: 0,
                text: '-',
                characterList
            }),
            buttonBlock
        ]
    } else {
        // html = html.replace(/\[jsdemo_loader\]([^"]+)/, function ($0, $1) {
        //     return `/fn/jsdemo_loader/?url=${encodeURIComponent($1)}`
        // })
        // html = html.replace(/(<a[^>]*href=")([^"]+"[^>]*>)/, '$1http://replace.lbs.amap.com$2')
        blocks = convertFromHTML(html)
    }
    return blocks
}
function restoreUrl(str) {
    return str.replace(/http:\/\/replace\.lbs\.amap\.com\//g, '')
}
function importFromMDTab($tabs) {
    let tabs = []
    $tabs.find('.lbs_tabs > a').each(function () {
        let tab = {
            title: $(this).text().trim(),
        }
        tab.editorState = importFromHTML($tabs.find('.lbs_tab_content').eq($(this).index()).html())
        tabs.push(tab)
    })
    let entityKey = Entity.create('tab', 'IMMUTABLE', {
        tabData: {
            tabs
        }
    })
    let characterList = List('-'.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    return [new ContentBlock({
            key: genKey(),
            type: 'atomic',
            depth: 0,
            text: '-',
            characterList
        }
    )]
}
function importFromImg($img) {
    let newPage = false
    let url = ''
    if ($img[0].nodeName === 'A') {
        url = $img.attr('href').replace(/http:\/\/replace\.lbs\.amap\.com\//g, '')
        newPage = $img.attr('target') === '_blank'
        $img = $img.find('img')

    }
    if ($img.attr('alt') === 'iframe') {
        let $iframe = $(`<iframe src="${$img.attr('src')}"></iframe>`)
        return importFromRawHTML($iframe)
    } else {
        let imageEntityKey = Entity.create('image', 'IMMUTABLE', {
            imgData: {
                img: $img.attr('src'),
                url,
                newPage,
                width: parseInt($img.attr('width') || $img.css('width')) || ''
            }
        })
        let imageCharacterList = List('-'.split('').map(function () {
            return CharacterMetadata.create({
                entity: imageEntityKey
            })
        }))
        return new ContentBlock({
            key: genKey(),
            type: 'atomic',
            depth: 0,
            text: '-',
            characterList: imageCharacterList
        })
    }
}
function importFromRawHTML($raw) {
    let html = $raw[0].outerHTML
    html = restoreUrl(html)
    let entityKey = Entity.create('html', 'IMMUTABLE', {
        htmlData: {
            html
        }
    })
    let characterList = List('-'.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    let block = new ContentBlock({
            key: genKey(),
            type: 'atomic',
            depth: 0,
            text: '-',
            characterList
        }
    )
    return block
}
function importFromProcess() {
    let imageEntityKey = Entity.create('image', 'IMMUTABLE', {
        imgData: {
            img: '//a.amap.com/lbs/static/md/process.png',
            url: '',
            newPage: false,
            width: 332
        }
    })
    let imageCharacterList = List('-'.split('').map(function () {
        return CharacterMetadata.create({
            entity: imageEntityKey
        })
    }))
    let imageBlock = new ContentBlock({
        key: genKey(),
        type: 'atomic',
        depth: 0,
        text: '-',
        characterList: imageCharacterList
    })
    let entityKey = Entity.create('button', 'MUTABLE', {
        data: {
            newPage: false,
            type: 'white',
            url: '/dev',
            width: 158,
            height: 38
        }
    })
    let text = '获取API Key'
    let characterList = List(text.split('').map(function () {
        return CharacterMetadata.create({
            entity: entityKey
        })
    }))
    let unstyledBlock = new ContentBlock({
            key: genKey(),
            type: 'unstyled',
            depth: 0,
            text,
            characterList
        }
    )
    return [
        imageBlock,
        unstyledBlock
    ]
}
function importFromTable($table) {
    let rowCount = $table.find('tr').length
    let columnCount = 0
    $table.find('tr').first().find('td,th').each(function () {
        columnCount += parseInt($(this).attr('colspan') || 1)
    })
    let width = $table.attr('width') || $table.css('width')
    if (width !== '100%') {
        width = parseInt(width)
    }
    if (!width) {
        width = '100%'
    }
    let meta = {
        'class': $table.attr('class'),
        width
    }
    let data = []
    for (let i = 0; i < rowCount; ++i) {
        let row = []
        for (let j = 0; j < columnCount; ++j) {
            row.push({
                style: {},
                rowspan: 1,
                colspan: 1,
                contentState: convertToRaw(ContentState.createFromText(''))
            })
        }
        data.push(row)
    }
    let rowMeta = []
    $table.find('tr').each(function (rowIndex) {
        let rowData = data[rowIndex].filter(item => !item.invalid)
        let currentRowColumnIndex = 0
        let startValidColumnIndex = 0
        data[rowIndex].some((item, i) => {
            if (!item.invalid) {
                startValidColumnIndex = i
                return true
            }
        })
        $(this).find('th,td').each(function () {
            if ($(this)[0].nodeName === 'th') {
                rowMeta[rowIndex] = rowMeta[rowIndex] || {title: true}
            }
            let rowspan = parseInt($(this).attr('rowspan')) || 1
            let colspan = parseInt($(this).attr('colspan')) || 1
            //这里不能使用rowData[currentRowColumnIndex]={}的方式赋值
            let cellHTML = $(this).html()
            // let contentState = convertToRaw(ContentState.createFromBlockArray(convertFromHTML(cellHTML)))

            // if ($(cellHTML).length === 0) {
            //     debugger
            if (cellHTML.indexOf('<p>') === -1) {
                cellHTML = `<p>${cellHTML}</p>`
            }
            // }
            let editorState = importFromHTML(cellHTML, {})
            let contentState = convertToRaw(editorState.getCurrentContent())
            rowData[currentRowColumnIndex].rowspan = Math.min(rowspan, rowCount - rowIndex)
            rowData[currentRowColumnIndex].colspan = Math.min(colspan, columnCount - currentRowColumnIndex)
            rowData[currentRowColumnIndex].contentState = contentState
            rowData[currentRowColumnIndex].style = {
                whiteSpace: $(this).css('white-space')
            }
            for (let i = 0; i < rowspan; ++i) {
                for (let j = 0; j < colspan; ++j) {
                    if (i === 0 && j === 0) {
                        continue
                    }
                    let columnIndex = startValidColumnIndex + currentRowColumnIndex + j
                    //此单元格是无效的，只是填充需要
                    // if (data[rowIndex + i]) {
                    if (data[rowIndex + i] && data[rowIndex + i][columnIndex]) {
                        data[rowIndex + i][columnIndex].invalid = true
                        data[rowIndex + i][columnIndex].validCell = {
                            rowIndex,
                            columnIndex: startValidColumnIndex + currentRowColumnIndex
                        }
                    }
                    // }
                }
            }
            currentRowColumnIndex += colspan
        })
    })
    for (let j = 0; j < columnCount; ++j) {
        let validColumn = false
        for (let i = 0; i < rowCount; ++i) {
            if (!data[i][j].invalid) {
                validColumn = true
                break
            }
        }
        if (!validColumn) {
            let columnListHandled = []
            for (let i = 0; i < rowCount; ++i) {
                let cell = data[i][j]
                if (!columnListHandled.some((item) => {
                        return item.rowIndex == cell.validCell.rowIndex && item.columnIndex === cell.validCell.columnIndex
                    })) {
                    data[cell.validCell.rowIndex][cell.validCell.columnIndex].colspan -= 1
                    if (data[cell.validCell.rowIndex][cell.validCell.columnIndex].colspan < 1) {
                        debugger
                    }
                    columnListHandled.push(cell.validCell)
                }
            }
            deleteColumn(j)
            j--
        }
    }

    function deleteColumn(columnIndex) {
        let finalData = []
        for (let i = 0; i < rowCount; ++i) {
            let newRow = [
                ...data[i].slice(0, columnIndex),
                ...data[i].slice(columnIndex + 1)
            ]
            finalData.push(newRow)
        }
        columnCount -= 1
        data = finalData
    }

    // $table.find('tr').each(function () {
    //     let row = []
    //     $(this).find('td,th').each(function () {
    //         let cellHTML = $(this).html()
    //         let contentState = convertToRaw(ContentState.createFromBlockArray(convertFromHTML(cellHTML)))
    //         row.push({
    //             colspan: parseInt($(this).attr('colspan') || 1),
    //             rowspan: parseInt($(this).attr('rowspan') || 1),
    //             contentState,
    //             style: {
    //                 whiteSpace: $(this).css('white-space')
    //             }
    //         })
    //     })
    //     data.push(row)
    // })
    // for (let i = 0; i < rowCount; ++i) {
    //     for (let j = 0; j < columnCount; ++j) {
    //         if (!data[i][j]) {
    //             data[i][j] = {
    //                 colspan: 1,
    //                 rowspan: 1,
    //                 contentState: convertToRaw(ContentState.createFromText('')),
    //                 style: {},
    //                 value: ''
    //             }
    //         }
    //     }
    // }
    let tableData = {
        rowCount,
        columnCount,
        data,
        meta
    }
    let entityKey = Entity.create('table', 'IMMUTABLE', {
        tableData
    })
    let oneChar = CharacterMetadata.create({
        entity: entityKey
    })
    let characterList = List([oneChar])
    return [new ContentBlock({
        key: genKey(),
        type: 'atomic',
        depth: 0,
        text: '-',
        characterList
    })]
    // } catch (e) {
    //     return []
    // }
}
// console.log(convertFromHTML(`
// <p><a href="xxx">点击我获取&lt;&lt;1</a></p>
// `)[0].toJS())
//
//importFromHTML(`
//    <p><a href="" title="" class="left_60p"></a></p>
//    <p>默认信息窗体封装了关闭按钮，使用API默认的信息窗体样式，这个时候只需要对InfoWindow设定content属性即可，content可以是dom对象，也可以是html识别的字符串：</p>
//    <pre class="brush: js">     //构建信息窗体中显示的内容
//     function openInfo() {
//       }
//    </pre>
//    <p><a href="" title="" class="right_40p"></a>
//<img src="http://lbs.amap.com/fn/iframe?id=2596&amp;guide=1&amp;litebar=3" alt="iframe">
//<a href="http://lbs.amap.com/fn/jsdemo_loader/?url=http://lbs.amap.com/fn/iframe?id=2596">亲手试一试<span></span></a></p>
//`, {}, true)

// const state = ContentState.createFromBlockArray(blocksFromHTML)
// importFromHTML(`
//     <p>
//         <span>aa</span>
//         <br/>xxx
//         <br/>
//         ===process===
//     </p>
//     <h2 id="title:aaa">xxxx</h2>
//     <pre class="brush: java">
//
//         //地图包、搜索包需要的基础权限
//
//         <!--允许程序打开网络套接字-->
//         &lt;uses-permission android:name="android.permission.INTERNET" /&gt;
//         <!--允许程序设置内置sd卡的写权限-->
//         &lt;uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" /&gt;
//         <!--允许程序获取网络状态-->
//         &lt;uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" /&gt;
//         <!--允许程序访问WiFi网络信息-->
//         &lt;uses-permission android:name="android.permission.ACCESS_WIFI_STATE" /&gt;
//         <!--允许程序读写手机状态和身份-->
//         &lt;uses-permission android:name="android.permission.READ_PHONE_STATE" /&gt;
//         <!--允许程序访问CellID或WiFi热点来获取粗略的位置-->
//         &lt;uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" /&gt;
//
//     </pre>
//     <table style="height: 318px; width: 498.359375px;" class="run">
//         <tbody>
//         <tr>
//         <td style="width: 135px;">参数</td>
//         <td style="width: 197px;">说明</td>
//         <td style="width: 147.359375px;">示例</td>
//         </tr>
//         <tr>
//         <td style="width: 135px;">keyword</td>
//         <td style="width: 197px;">POI关键字</td>
//         <td style="width: 147.359375px;">例如：首开广场</td>
//         </tr>
//         <tr>
//         <td style="width: 135px;">poiType</td>
//         <td style="width: 197px;">POI类型</td>
//         <td style="width: 147.359375px;">例如：写字楼</td>
//         </tr>
//         <tr>
//         <td style="width: 135px;">city</td>
//         <td style="width: 197px;">POI所在的城市名称</td>
//         <td style="width: 147.359375px;">例如：北京</td>
//         </tr>
//         <tr>
//         <td style="width: 135px;">size</td>
//         <td style="width: 197px;">最大创建的围栏数目，最大值为25，默认为10</td>
//         <td style="width: 147.359375px;"></td>
//         </tr>
//         <tr>
//         <td style="width: 135px;">customId&nbsp;</td>
//         <td style="width: 197px;">与围栏关联的自有业务Id</td>
//         <td style="width: 147.359375px;"></td>
//         </tr>
//         </tbody>
//     </table>
// `)