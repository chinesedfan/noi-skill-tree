/* globals G6, data */
const graph = new G6.Graph({
    container: 'container',
    data,
    node: {
        style: {
            labelText: d => d.label,
            labelBackground: true,
        },
        palette: {
            type: 'group',
            field: 'level',
        },
    },
    layout: {
        type: 'force',
        linkDistance: 50,
        clustering: true,
        nodeClusterBy: 'cluster',
        clusterNodeStrength: 70,
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-element'],
    autofit: 'view',
})

graph.render()
