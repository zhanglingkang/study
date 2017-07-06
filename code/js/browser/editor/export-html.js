import React from 'react'
import ReactDOM from 'react-dom'
import Clipboard from 'clipboard'
import {stateToHTML} from '@alife/draft-js-export-html'
import {getEntity} from './util'
export default class Image extends React.Component {
    static propTypes = {}

    constructor(props) {
        super(props)

    }

    componentDidMount() {
        this.clipboard = new Clipboard(ReactDOM.findDOMNode(this.refs.root), {
            text: (trigger) => {
                let inlineRenderers = {}
                this.props.plugins.forEach((plugin) => {
                    if (plugin.decoratorOptions) {
                        inlineRenderers[plugin.ENTITY_TYPE] = plugin.toHTML
                    }
                })
                let options = {
                    inlineStyles: {
                        BOLD: {element: 'b'},
                        ITALIC: {
                            attributes: {class: 'foo'},
                            style: {fontSize: 12}
                        },
                        RED: {style: {color: '#900'}},
                    },
                    blockRenderers: {
                        atomic: (contentBlock) => {
                            let result
                            let {editorState} = this.props
                            const entity = getEntity(editorState, contentBlock)

                            this.props.plugins.some((plugin) => {
                                if (entity.getType() === plugin.ENTITY_TYPE) {
                                    result = plugin.toHTML('', entity)
                                    return true
                                }
                            })
                            return result
                        },
                        unstyled: (contentBlock,content) => {
                            return `<table>
                              <tr><td>${content}</td></tr>          
                            </table>`
                        }
                    },
                    inlineRenderers
                }
                return stateToHTML(this.props.editorState.getCurrentContent(), options)
            }
        })
    }

    componentWillUnmount() {
        this.clipboard.destroy()
    }

    render() {
        return <div className="toolbar-btn" onClick={this.handleClick} ref="root">
            导出HTML
        </div>
    }
}