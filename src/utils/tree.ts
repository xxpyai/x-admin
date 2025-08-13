/**
 * @description 提取菜单树中的每一项uniqueId
 * @param tree 树
 * @returns 每一项uniqueId组成的数组
 */
export const extractPathList = (tree: any[]): any => {
    if (!Array.isArray(tree)) {
        console.warn('tree must be an array')
        return []
    }

    if (!tree?.length) return []

    const expandedPaths: Array<number | string> = []
    for (const node of tree) {
        node?.children?.length && extractPathList(node.children)
        expandedPaths.push(node.uniqueId)
    }

    return expandedPaths
}

/**
 * @description 如果父级下 children 的 length 为 1，删除 children 并自动组建唯一 uniqueId
 * @param tree 树
 * @param pathList 每一项的id组成的数组
 * @returns 组件唯一 uniqueId 后的树
 */
export const deleteChildren = (tree: any[], pathList = []): any => {
    if (!Array.isArray(tree)) {
        console.warn('menuTree must be an array')
        return []
    }

    if (!tree?.length) return []

    for (const [key, node] of tree.entries()) {
        if (node.children && node.children.length === 1) delete node.children
        node.id = key
        node.parentId = pathList.length ? pathList[pathList.length - 1] : null
        node.pathList = [...pathList, node.id]
        node.uniqueId = node.pathList.length > 1 ? node.pathList.join('-') : node.pathList[0]
        node?.children?.length && deleteChildren(node.children, node.pathList)
    }

    return tree
}

/**
 * @description 创建层级关系
 * @param tree 树
 * @param pathList 每一项的id组成的数组
 * @returns 创建层级关系后的树
 */
export const buildHierarchyTree = (tree: any[], pathList = []): any => {
    if (!Array.isArray(tree)) {
        console.warn('tree must be an array')
        return []
    }

    if (!tree?.length) return []

    for (const [key, node] of tree.entries()) {
        node.id = key
        node.pathList = [...pathList, node.id]
        node.parentId = pathList.length ? pathList[pathList.length - 1] : null
        node?.children?.length && buildHierarchyTree(node.children, node.pathList)
    }

    return tree
}

/**
 * @description 广度优先遍历，根据唯一uniqueId找当前节点信息
 * @param tree 树
 * @param uniqueId 唯一uniqueId
 * @returns 当前节点信息
 */
export const getNodeByUniqueId = (tree: any[], uniqueId: number | string): any => {
    if (!Array.isArray(tree)) {
        console.warn('menuTree must be an array')
        return []
    }

    if (!tree?.length) return []

    const item = tree.find(node => node.uniqueId === uniqueId)

    if (item) return item

    const childrenList = tree
        .filter(node => node.children)
        .map(i => i.children)
        .flat(1) as unknown

    return getNodeByUniqueId(childrenList as any[], uniqueId)
}

/**
 * @description 向当前唯一uniqueId节点中追加字段
 * @param tree 树
 * @param uniqueId 唯一uniqueId
 * @param fields 需要追加的字段
 * @returns 追加字段后的树
 */
export const appendFieldByUniqueId = (tree: any[], uniqueId: number | string, fields: object): any => {
    if (!Array.isArray(tree)) {
        console.warn('menuTree must be an array')
        return []
    }

    if (!tree?.length) return []

    for (const node of tree) {
        if (node.uniqueId === uniqueId && Object.prototype.toString.call(fields) === '[object Object]') {
            Object.assign(node, fields)
        }

        node?.children?.length && appendFieldByUniqueId(node.children, uniqueId, fields)
    }

    return tree
}

/**
 * @description 构造树型结构数据
 * @param data 数据源
 * @param id id字段 默认id
 * @param parentId 父节点字段，默认parentId
 * @param children 子节点字段，默认children
 * @returns 追加字段后的树
 */
export const handleTree = (data: any[], id?: string, parentId?: string, children?: string): any => {
    if (!Array.isArray(data)) {
        console.warn('data must be an array')
        return []
    }

    const config = {
        id: id || 'id',
        parentId: parentId || 'parentId',
        childrenList: children || 'children'
    }

    const tree = []
    const nodeIds: any = {}
    const childrenListMap: any = {}

    for (const d of data) {
        const parentId = d[config.parentId]
        if (childrenListMap[parentId] == null) {
            childrenListMap[parentId] = []
        }
        nodeIds[d[config.id]] = d
        childrenListMap[parentId].push(d)
    }

    for (const d of data) {
        const parentId = d[config.parentId]
        if (nodeIds[parentId] == null) {
            tree.push(d)
        }
    }

    for (const t of tree) {
        adaptToChildrenList(t)
    }

    function adaptToChildrenList(o: Record<string, any>) {
        if (childrenListMap[o[config.id]] !== null) {
            o[config.childrenList] = childrenListMap[o[config.id]]
        }
        if (o[config.childrenList]) {
            for (const c of o[config.childrenList]) {
                adaptToChildrenList(c)
            }
        }
    }

    return tree
}
