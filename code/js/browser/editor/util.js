import {
    Modifier,
    EditorState,
    AtomicBlockUtils
} from 'draft-js'
import Immutable from 'immutable'

import {
    getSelectionEntity
} from 'draftjs-utils'

export * from 'draftjs-utils'


export function getSelectionEntity2(editorState) {
    const entityKey = getSelectionEntity(editorState)
    return entityKey ? editorState.getCurrentContent().getEntity(entityKey) : null
}
export function insertBlock(editorState, blocks) {
    let contentState = editorState.getCurrentContent()
    let selectionState = editorState.getSelection()
    let blockMap = Immutable.OrderedMap(blocks.map((block) => [block.getKey(), block]))
    var newContentState = Modifier.replaceWithFragment(contentState, selectionState, blockMap);

    //var newContent = withAtomicBlock.merge({
    //    selectionBefore: selectionState,
    //    selectionAfter: withAtomicBlock.getSelectionAfter().set('hasFocus', true)
    //});

    return EditorState.push(editorState, newContentState, 'insert-fragment');
}

export function insertAtomicBlock(editorState, entityOptions) {
    const contentState = editorState.getCurrentContent()
    let {type, immutable, data}=entityOptions
    const contentStateWithEntity = contentState.createEntity(type, immutable, data)
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, '-')
}
export function getEntity(editorState, contentBlock) {
    const entityKey = contentBlock.getEntityAt(0)
    return editorState.getCurrentContent().getEntity(entityKey)
}

export function replaceEntityData(editorState, entityKey, data) {
    const newContentState = editorState.getCurrentContent().replaceEntityData(entityKey, data)
    return EditorState.push(editorState, newContentState, 'apply-entity')
}
export function applyEntity(editorState, entityOptions) {
    let contentState = editorState.getCurrentContent()
    let entityKey = null
    let contentStateWithEntity = contentState
    if (entityOptions) {
        let {type, immutable, data}=entityOptions
        contentStateWithEntity = contentState.createEntity(type, immutable, data)
        entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    }
    const newContentState = Modifier.applyEntity(contentStateWithEntity, editorState.getSelection(), entityKey)
    return EditorState.push(editorState, newContentState, 'apply-entity')
}
export function getFindEntityStrategy(entityType) {
    return function (contentBlock, callback, contentState) {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity();
                return (
                    entityKey !== null &&
                    contentState.getEntity(entityKey).getType() === entityType
                )
            },
            callback
        )
    }
}
