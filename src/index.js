/* globals G6, data */

// Define the categories and levels for organizing skills
const categories = [
    { id: 'env', name: '计算机基础与编程环境', x: 0 },
    { id: 'cpp', name: 'C++程序设计', x: 1 },
    { id: 'ds', name: '数据结构', x: 2 },
    { id: 'algo', name: '算法', x: 3 },
    { id: 'math', name: '数学', x: 4 }
];

const levels = [
    { id: 'basic', name: '入门级', range: [1, 3], y: 0 },
    { id: 'intermediate', name: '提高级', range: [4, 6], y: 1 },
    { id: 'noi', name: 'NOI级', range: [7, 10], y: 2 }
];

// Map node IDs to their objects for quick lookup
const nodeMap = {};
const nodeGroups = {};

let ignoreCloseListener = false;

// Process data to organize nodes
function processData() {
    // First pass: map nodes and identify parent-child relationships
    data.nodes.forEach(node => {
        // Store node in map for quick lookup
        nodeMap[node.id] = {
            ...node,
            children: [],
            parents: []
        };
    });
    
    // Second pass: build parent-child relationships
    data.edges.forEach(edge => {
        const source = nodeMap[edge.source];
        const target = nodeMap[edge.target];
        
        if (source && target) {
            source.children.push(target.id);
            target.parents.push(source.id);
        }
    });
    
    // Group nodes by common prefixes (for flower diagrams)
    const prefixMap = {};
    
    Object.keys(nodeMap).forEach(nodeId => {
        // Extract prefix (e.g., "2.1.2.4" from "2.1.2.4.1")
        const parts = nodeId.split('.');
        if (parts.length > 3) {
            const prefix = parts.slice(0, parts.length - 1).join('.');
            if (!prefixMap[prefix]) {
                prefixMap[prefix] = [];
            }
            prefixMap[prefix].push(nodeId);
        }
    });
    
    // Create node groups for prefixes with multiple children
    Object.keys(prefixMap).forEach(prefix => {
        if (prefixMap[prefix].length > 2) {
            nodeGroups[prefix] = {
                children: prefixMap[prefix],
                label: findCommonLabel(prefixMap[prefix])
            };
        }
    });
}

// Find common label prefix for a group of nodes
function findCommonLabel(nodeIds) {
    if (nodeIds.length === 0) return '';
    
    const labels = nodeIds.map(id => nodeMap[id].label);
    const firstLabel = labels[0];
    
    // Find common words at the beginning
    const words = firstLabel.split(/\s+/);
    let commonPrefix = '';
    
    for (let i = 0; i < Math.min(3, words.length); i++) {
        const currentPrefix = words.slice(0, i + 1).join(' ');
        let isCommon = true;
        
        for (let j = 1; j < labels.length; j++) {
            if (!labels[j].startsWith(currentPrefix)) {
                isCommon = false;
                break;
            }
        }
        
        if (isCommon) {
            commonPrefix = currentPrefix;
        } else {
            break;
        }
    }
    
    return commonPrefix || '相关知识点';
}

// Truncate text to a certain length
function truncateText(text, maxLength = 20) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Determine category and level for a node based on ID
function getCategoryAndLevel(nodeId) {
    let category, level;
    
    // Determine category based on node ID pattern
    if (nodeId.startsWith('2.1.1') || nodeId.startsWith('2.2.0')) {
        category = 'env';
    } else if (nodeId.startsWith('2.1.2') || nodeId.startsWith('2.2.1')) {
        category = 'cpp';
    } else if (nodeId.startsWith('2.1.3') || nodeId.startsWith('2.2.2') || nodeId.startsWith('2.3.1')) {
        category = 'ds';
    } else if (nodeId.startsWith('2.1.4') || nodeId.startsWith('2.2.3') || nodeId.startsWith('2.3.2')) {
        category = 'algo';
    } else {
        category = 'math';
    }
    
    // Determine level based on node's level value
    const levelValue = nodeMap[nodeId].data.level;
    if (levelValue >= 1 && levelValue <= 3) {
        level = 'basic';
    } else if (levelValue >= 4 && levelValue <= 6) {
        level = 'intermediate';
    } else {
        level = 'noi';
    }
    
    return { category, level };
}

// Get color for level
function getColorForLevel(level) {
    const colorMap = {
        1: 'grey',
        2: 'grey',
        3: 'green',
        4: 'green',
        5: '#03a89e',
        6: 'blue',
        7: '#a0a',
        8: '#ff8c00',
        9: 'red',
        10: 'red'
    };
    
    return colorMap[level] || '#91d5ff';
}

// Get text color based on background color
function getTextColorForLevel(level) {
    return level > 2 ? '#fff' : '#333';
}

// Create G6 graph data
function createGraphData() {
    const nodes = [];
    const edges = [];
    
    // Create background grid areas as nodes
    categories.forEach(category => {
        levels.forEach(level => {
            nodes.push({
                id: `grid-${level.id}-${category.id}`,
                x: 200 + category.x * 220 + 100,
                y: 100 + level.y * 200 + 90,
                type: 'rect',
                size: [200, 180],
                style: {
                    fill: `var(--${category.id}-bg-color)`,
                    stroke: 'rgba(0,0,0,0.05)',
                    radius: 12
                },
                zIndex: 0
            });
        });
    });
    
    // Create category labels
    categories.forEach(category => {
        nodes.push({
            id: `cat-${category.id}`,
            x: 200 + category.x * 220 + 100,
            y: 50,
            type: 'text',
            label: category.name,
            labelCfg: {
                style: {
                    fill: '#1890ff',
                    fontSize: 14,
                    fontWeight: 'bold',
                    textAlign: 'center'
                }
            },
            zIndex: 1
        });
    });
    
    // Create level labels
    levels.forEach(level => {
        nodes.push({
            id: `level-${level.id}`,
            x: 100,
            y: 100 + level.y * 200 + 90,
            type: 'text',
            label: level.name,
            labelCfg: {
                style: {
                    fill: '#1890ff',
                    fontSize: 14,
                    fontWeight: 'bold',
                    textAlign: 'right'
                }
            },
            zIndex: 1
        });
    });
    
    // Track nodes by grid cell for positioning
    const gridCells = {};
    categories.forEach(category => {
        levels.forEach(level => {
            const cellKey = `${level.id}-${category.id}`;
            gridCells[cellKey] = {
                nodes: [],
                groupNodes: [],
                individualNodes: [],
                x: 200 + category.x * 220 + 100,
                y: 100 + level.y * 200 + 90,
                width: 180,
                height: 160
            };
        });
    });
    
    // First pass: collect nodes by cell
    
    // Add group nodes to their cells
    Object.keys(nodeGroups).forEach(groupId => {
        const group = nodeGroups[groupId];
        const sampleNodeId = group.children[0];
        const { category, level } = getCategoryAndLevel(sampleNodeId);
        
        const catObj = categories.find(c => c.id === category);
        const levelObj = levels.find(l => l.id === level);
        
        if (catObj && levelObj) {
            const cellKey = `${levelObj.id}-${catObj.id}`;
            const cell = gridCells[cellKey];
            
            if (cell) {
                cell.groupNodes.push({
                    id: `group-${groupId}`,
                    groupId,
                    label: truncateText(group.label),
                    children: group.children,
                    tooltip: group.label
                });
            }
        }
    });
    
    // Add individual nodes to their cells
    Object.keys(nodeMap).forEach(nodeId => {
        // Skip nodes that are part of a group
        let isInGroup = false;
        for (const groupId in nodeGroups) {
            if (nodeGroups[groupId].children.includes(nodeId)) {
                isInGroup = true;
                break;
            }
        }
        
        if (!isInGroup) {
            const node = nodeMap[nodeId];
            const { category, level } = getCategoryAndLevel(nodeId);
            
            const catObj = categories.find(c => c.id === category);
            const levelObj = levels.find(l => l.id === level);
            
            if (catObj && levelObj) {
                const cellKey = `${levelObj.id}-${catObj.id}`;
                const cell = gridCells[cellKey];
                
                if (cell) {
                    cell.individualNodes.push({
                        id: nodeId,
                        label: truncateText(node.label, 15),
                        level: node.data.level,
                        originalId: nodeId,
                        tooltip: node.label
                    });
                }
            }
        }
    });
    
    // Second pass: position nodes in a grid pattern within each cell
    Object.values(gridCells).forEach(cell => {
        // Combine group and individual nodes
        cell.nodes = [...cell.groupNodes, ...cell.individualNodes];
        
        if (cell.nodes.length === 0) return;
        
        const nodeCount = cell.nodes.length;
        
        // Determine grid dimensions
        const cols = Math.ceil(Math.sqrt(nodeCount));
        const rows = Math.ceil(nodeCount / cols);
        
        const cellWidth = cell.width / cols;
        const cellHeight = cell.height / rows;
        
        // Position nodes in a grid pattern
        cell.nodes.forEach((nodeInfo, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            
            // Calculate position
            const x = cell.x - cell.width/2 + cellWidth/2 + col * cellWidth;
            const y = cell.y - cell.height/2 + cellHeight/2 + row * cellHeight;
            
            if (nodeInfo.groupId) {
                // This is a group node
                const node = {
                    id: nodeInfo.id,
                    x,
                    y,
                    size: 40,
                    label: nodeInfo.label,
                    style: {
                        fill: '#fff',
                        stroke: '#1890ff',
                        lineWidth: 2
                    },
                    labelCfg: {
                        position: 'bottom',
                        offset: 5,
                        style: {
                            fill: '#333'
                        }
                    },
                    isGroup: true,
                    groupId: nodeInfo.groupId,
                    tooltip: nodeInfo.tooltip,
                    zIndex: 2,
                    expanded: false // Set groups to collapsed by default
                };
                
                nodes.push(node);
                
                // Create child nodes (initially hidden)
                const childIds = nodeInfo.children || [];
                const petalCount = childIds.length;
                const radius = 60;
                
                for (let i = 0; i < petalCount; i++) {
                    const angle = (i * 2 * Math.PI) / petalCount;
                    const petalX = x + radius * Math.cos(angle);
                    const petalY = y + radius * Math.sin(angle);
                    const childId = childIds[i];
                    const childNode = nodeMap[childId];
                    
                    if (childNode) {
                        // Add child node (initially hidden)
                        const childNodeObj = {
                            id: childId,
                            x: petalX,
                            y: petalY,
                            size: 30,
                            label: truncateText(childNode.label, 15),
                            style: {
                                fill: getColorForLevel(childNode.data.level),
                                stroke: '#fff',
                                lineWidth: 1,
                            },
                            labelCfg: {
                                position: 'bottom',
                                offset: 5,
                                style: {
                                    fill: getTextColorForLevel(childNode.data.level),
                                }
                            },
                            level: childNode.data.level,
                            originalId: childId,
                            tooltip: childNode.label,
                            visible: false,
                            zIndex: 3
                        };
                        
                        nodes.push(childNodeObj);
                        
                        // Add edge (initially hidden)
                        edges.push({
                            source: nodeInfo.id,
                            target: childId,
                            style: {
                                stroke: '#ccc',
                                endArrow: false,
                            }
                        });
                    }
                }
            } else {
                // This is an individual node
                const node = {
                    id: nodeInfo.id,
                    x,
                    y,
                    size: 30,
                    label: nodeInfo.label,
                    style: {
                        fill: getColorForLevel(nodeInfo.level),
                        stroke: '#fff',
                        lineWidth: 1
                    },
                    labelCfg: {
                        position: 'bottom',
                        offset: 5,
                        style: {
                            fill: getTextColorForLevel(nodeInfo.level)
                        }
                    },
                    level: nodeInfo.level,
                    originalId: nodeInfo.originalId,
                    tooltip: nodeInfo.tooltip,
                    zIndex: 3
                };
                
                nodes.push(node);
            }
        });
    });
    
    // Create edges between individual nodes
    data.edges.forEach(edge => {
        // Skip edges if either source or target is in a group
        let sourceInGroup = false;
        let targetInGroup = false;
        
        for (const groupId in nodeGroups) {
            if (nodeGroups[groupId].children.includes(edge.source)) {
                sourceInGroup = true;
            }
            if (nodeGroups[groupId].children.includes(edge.target)) {
                targetInGroup = true;
            }
        }
        
        if (!sourceInGroup && !targetInGroup) {
            edges.push({
                source: edge.source,
                target: edge.target,
                style: {
                    stroke: '#ccc',
                    lineWidth: 1,
                    endArrow: {
                        path: G6.Arrow.triangle(4, 6, 0),
                        fill: '#ccc'
                    }
                }
            });
        }
    });
    
    return {
        nodes,
        edges
    };
}

// Toggle group expansion
function toggleGroupExpansion(groupId) {
    const graph = window.skillGraph; // Get the graph instance from the window object
    if (!graph) return;
    
    // Find the group node
    const groupNodeId = `group-${groupId}`;
    const groupNode = graph.findById(groupNodeId);
    if (!groupNode) return;
    
    const groupModel = groupNode.getModel();
    const isExpanded = groupModel.expanded === true;
    
    // Find children of this group
    const group = nodeGroups[groupId];
    if (!group) return;
    
    const childIds = group.children || [];
    
    // Show drawer with child nodes information
    showDrawer(groupId, childIds);
    
    if (isExpanded) {
        // Collapse: Update child nodes to be invisible
        childIds.forEach(childId => {
            const childNode = graph.findById(childId);
            if (childNode) {
                graph.hideItem(childNode);
            }
        });
        
        // Update group node style
        graph.updateItem(groupNode, {
            expanded: false,
            style: {
                fill: '#fff',
                stroke: '#1890ff',
                lineWidth: 2
            }
        });
        
    } else {
        // Expand: Show all child nodes in a flower pattern
        const visibleChildCount = childIds.length;
        
        // Show and position child nodes in a flower pattern
        for (let i = 0; i < visibleChildCount; i++) {
            const childId = childIds[i];
            
            const childNode = graph.findById(childId);
            if (childNode) {
                graph.showItem(childNode);
            }
        }
        
        // Update group node style to indicate expansion
        graph.updateItem(groupNode, {
            expanded: true,
            style: {
                fill: '#e6f7ff',
                stroke: '#1890ff',
                lineWidth: 2
            }
        });
    }
    
    // Update the graph
    graph.refreshPositions();
}

// Function to show drawer with group node children
function showDrawer(groupId, childIds) {
    ignoreCloseListener = true;

    const drawer = document.getElementById('drawer-panel');
    const drawerTitle = document.getElementById('drawer-title');
    const drawerList = document.getElementById('drawer-list');
    
    // Clear previous content
    drawerList.innerHTML = '';
    
    // Set drawer title
    const groupTitle = nodeGroups[groupId].label || '知识点分组';
    drawerTitle.textContent = groupTitle;
    
    // Add child nodes to the drawer list
    childIds.forEach(childId => {
        const childNode = nodeMap[childId];
        if (!childNode) return;
        
        const listItem = document.createElement('li');
        listItem.className = 'drawer-list-item';
        listItem.dataset.nodeId = childId;
        
        const level = childNode.data.level || 1;
        
        // Create the HTML structure for the list item
        listItem.innerHTML = `
            <div class="drawer-list-item-badge level-${level}">${level}</div>
            <div class="drawer-list-item-content">
                <div class="drawer-list-item-title">${childNode.label}</div>
                <div class="drawer-list-item-desc">${childNode.data.description || ''}</div>
            </div>
        `;
        
        // Add click event to focus on the node
        listItem.addEventListener('click', () => {
            const graph = window.skillGraph;
            if (!graph) return;
            
            const node = graph.findById(childId);
            if (node) {
                // Focus on the node
                graph.focusItem(node);
                
                // Highlight the node temporarily
                graph.setItemState(node, 'highlight', true);
                setTimeout(() => {
                    graph.setItemState(node, 'highlight', false);
                }, 2000);
            }
        });
        
        drawerList.appendChild(listItem);
    });
    
    // Show the drawer
    drawer.style.display = 'flex';
    setTimeout(() => {
        ignoreCloseListener = false;
        drawer.classList.add('open');
    }, 0);
}

// Close drawer when close button is clicked
function closeDrawer() {
    const drawer = document.getElementById('drawer-panel');
    drawer.classList.remove('open');
    setTimeout(() => {
        drawer.style.display = 'none';
    }, 300); // Wait for transition to complete
}

// Initialize G6 graph
function initGraph() {
    const container = document.getElementById('skill-tree-container');
    
    // Register custom node
    registerCustomNode();
    
    // Create graph instance
    const graph = new G6.Graph({
        container: 'skill-tree-container',
        width: container.offsetWidth,
        height: container.offsetHeight,
        modes: {
            default: ['drag-canvas', 'drag-node', 'activate-relations'],
            edit: ['click-select']
        },
        defaultNode: {
            type: 'node-with-badge',
            size: 30,
            style: {
                fill: '#91d5ff',
                stroke: '#fff',
                lineWidth: 1
            },
            labelCfg: {
                position: 'bottom',
                offset: 10,
                style: {
                    fill: '#333',
                    fontSize: 12
                }
            }
        },
        defaultEdge: {
            style: {
                stroke: '#ccc',
                lineWidth: 1,
                endArrow: true
            }
        },
        fitView: true,
        fitViewPadding: [50, 50, 50, 50],
        animate: true,
        nodeStateStyles: {
            hover: {
                lineWidth: 3,
                shadowColor: '#1890ff',
                shadowBlur: 10
            },
            selected: {
                stroke: '#ff4d4f',
                lineWidth: 3
            }
        }
    });
    
    // Register node states for highlighting
    // G6.registerNodeState({
    //     highlight: {
    //         stroke: '#ffcc00',
    //         lineWidth: 3,
    //         animate: true,
    //         animateCfg: {
    //             duration: 300,
    //             easing: 'easeCubic',
    //             repeat: true,
    //             delay: 0
    //         }
    //     }
    // });
    
    // Create tooltip
    const tooltip = new G6.Tooltip({
        offsetX: 10,
        offsetY: 10,
        itemTypes: ['node'],
        getContent: (e) => {
            const model = e.item.getModel();
            if (model.tooltip) {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.width = 'max-content';
                div.style.maxWidth = '200px';
                div.style.fontSize = '12px';
                div.style.color = '#333';
                div.innerHTML = `
                    <div style="font-weight: bold; margin-bottom: 5px;">${model.tooltip}</div>
                    ${model.level ? `<div>难度级别: ${model.level}</div>` : ''}
                `;
                return div;
            }
            return '';
        }
    });
    
    graph.addPlugin(tooltip);
    
    // Load data and render
    const graphData = createGraphData();
    graph.data(graphData);
    graph.render();
    
    // Add event listeners
    let prevSelectedItem = null;
    graph.on('node:click', (e) => {
        if (prevSelectedItem) {
            const prevModel = prevSelectedItem.getModel();
            if (prevModel.isGroup) {
                toggleGroupExpansion(prevModel.groupId);
            } else if (prevModel.originalId) {
                showNodeDetails(prevModel.originalId);
            }

            graph.clearItemStates(prevSelectedItem, 'selected');
        }
        if (prevSelectedItem === e.item) {
            prevSelectedItem = null;
            return;
        }
        prevSelectedItem = e.item;

        const model = e.item.getModel();
        
        // Set selected state
        graph.setItemState(e.item, 'selected', true);
        
        if (model.isGroup) {
            // Handle group click - expand/collapse
            toggleGroupExpansion(model.groupId);
        } else if (model.originalId) {
            // Handle node click - show details
            showNodeDetails(model.originalId);
        }
    });
    
    // Add hover effect
    graph.on('node:mouseenter', (e) => {
        graph.setItemState(e.item, 'hover', true);
    });
    
    graph.on('node:mouseleave', (e) => {
        graph.setItemState(e.item, 'hover', false);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (graph) {
            graph.changeSize(container.offsetWidth, container.offsetHeight);
            graph.fitView();
        }
    });
    
    return graph;
}

// Register custom node with badge
function registerCustomNode() {
    G6.registerNode('node-with-badge', {
        draw(cfg, group) {
            const { size, style, labelCfg } = cfg;
            
            // Draw main circle
            const circle = group.addShape('circle', {
                attrs: {
                    x: 0,
                    y: 0,
                    r: size / 2,
                    ...style
                },
                name: 'circle-shape'
            });
            
            // Draw badge if level is provided
            if (cfg.level) {
                group.addShape('circle', {
                    attrs: {
                        x: size / 2 - 5,
                        y: -size / 2 + 5,
                        r: 8,
                        fill: '#fff',
                        stroke: '#1890ff',
                        lineWidth: 1
                    },
                    name: 'badge-circle'
                });
                
                group.addShape('text', {
                    attrs: {
                        text: cfg.level,
                        x: size / 2 - 5,
                        y: -size / 2 + 5,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        fontSize: 10,
                        fontWeight: 'bold',
                        fill: '#1890ff'
                    },
                    name: 'badge-text'
                });
            }
            
            return circle;
        },
        
        // Update node style when state changes
        setState(name, value, item) {
            const group = item.getContainer();
            const shape = group.get('children')[0]; // Get the circle shape
        }
    });
}

// Show node details in the detail panel
function showNodeDetails(nodeId) {
    const node = nodeMap[nodeId];
    if (!node) return;
    
    const detailPanel = document.getElementById('detail-panel');
    const detailContent = document.getElementById('detail-content');
    
    // Create content for detail panel
    let html = `
        <h4>${node.label}</h4>
        <p><strong>难度级别:</strong> ${node.data.level}</p>
        <p><strong>ID:</strong> ${nodeId}</p>
    `;
    
    // Find prerequisites (nodes that point to this node)
    const prerequisites = node.parents.map(id => nodeMap[id]);
    
    if (prerequisites.length > 0) {
        html += '<h5>前置知识点:</h5><ul>';
        prerequisites.forEach(prereq => {
            html += `<li>${prereq.label} (难度: ${prereq.data.level})</li>`;
        });
        html += '</ul>';
    }
    
    // Find dependent nodes (nodes that this node points to)
    const dependents = node.children.map(id => nodeMap[id]);
    
    if (dependents.length > 0) {
        html += '<h5>后续知识点:</h5><ul>';
        dependents.forEach(dependent => {
            html += `<li>${dependent.label} (难度: ${dependent.data.level})</li>`;
        });
        html += '</ul>';
    }
    
    detailContent.innerHTML = html;
    detailPanel.style.display = 'block';
}

// Initialize the application
function init() {
    processData();
    const graph = initGraph();
    
    // Store graph instance in window for access in other functions
    window.skillGraph = graph;
    
    document.body.addEventListener('click', () => {
        if (ignoreCloseListener) return;

        closeDrawer();
        document.getElementById('detail-panel').style.display = 'none';
    });
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
