// Public surface of the editing-bridge module.
// Templates import from here. Internals (provider state, styles) are not exported.

export { EditingBridgeProvider, useEditMode, useBridgeSections } from './provider'
export { Editable } from './Editable'
export { EditableImage } from './EditableImage'
export { EditableList } from './EditableList'
export { EditableLink } from './EditableLink'
export { EditableIcon } from './EditableIcon'
export { PROTOCOL_VERSION } from './types'
export type {
  BridgeStatus,
  Manifest,
  ListOp,
  Rect,
  BridgeInbound,
  BridgeOutbound,
} from './types'
