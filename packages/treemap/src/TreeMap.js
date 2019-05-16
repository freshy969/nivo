/*
 * This file is part of the nivo project.
 *
 * Copyright 2016-present, Raphaël Benitte.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import React, { memo } from 'react'
import { TransitionMotion, spring } from 'react-motion'
import { withContainer, SvgWrapper, useTheme } from '@nivo/core'
import { interpolateColor, getInterpolatedColor } from '@nivo/colors'
import { useTooltip } from '@nivo/tooltip'
import { TreeMapPropTypes } from './props'
import enhance from './enhance'
import { nodeWillEnter, nodeWillLeave } from './motion'
import { getNodeHandlers } from './interactivity'

const TreeMap = ({
    nodes,
    nodeComponent,

    margin,
    outerWidth,
    outerHeight,

    borderWidth,
    getBorderColor,
    defs,

    getLabelTextColor,
    orientLabel,

    animate,
    motionStiffness,
    motionDamping,

    isInteractive,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onClick,
    tooltipFormat,
    tooltip,
}) => {
    const theme = useTheme()
    const springConfig = {
        stiffness: motionStiffness,
        damping: motionDamping,
    }

    const { showTooltipFromEvent, hideTooltip } = useTooltip()

    const getHandlers = node =>
        getNodeHandlers(node, {
            isInteractive,
            onClick,
            showTooltip: showTooltipFromEvent,
            hideTooltip,
            theme,
            tooltipFormat,
            tooltip,
        })

    return (
        <SvgWrapper
            width={outerWidth}
            height={outerHeight}
            margin={margin}
            defs={defs}
            theme={theme}
        >
            {!animate && (
                <g>
                    {nodes.map(node =>
                        React.createElement(nodeComponent, {
                            key: node.path,
                            node,
                            style: {
                                fill: node.fill,
                                x: node.x0,
                                y: node.y0,
                                width: node.width,
                                height: node.height,
                                color: node.color,
                                borderWidth,
                                borderColor: getBorderColor(node),
                                labelTextColor: getLabelTextColor(node),
                                orientLabel,
                            },
                            handlers: getHandlers(node),
                        })
                    )}
                </g>
            )}
            {animate && (
                <TransitionMotion
                    willEnter={nodeWillEnter}
                    willLeave={nodeWillLeave(springConfig)}
                    styles={nodes.map(node => ({
                        key: node.path,
                        data: node,
                        style: {
                            x: spring(node.x, springConfig),
                            y: spring(node.y, springConfig),
                            width: spring(node.width, springConfig),
                            height: spring(node.height, springConfig),
                            ...interpolateColor(node.color, springConfig),
                        },
                    }))}
                >
                    {interpolatedStyles => (
                        <g>
                            {interpolatedStyles.map(({ style, data: node }) => {
                                style.color = getInterpolatedColor(style)

                                return React.createElement(nodeComponent, {
                                    key: node.path,
                                    node,
                                    style: {
                                        ...style,
                                        fill: node.fill,
                                        borderWidth,
                                        borderColor: getBorderColor(style),
                                        labelTextColor: getLabelTextColor(style),
                                        orientLabel,
                                    },
                                    handlers: getHandlers(node),
                                })
                            })}
                        </g>
                    )}
                </TransitionMotion>
            )}
        </SvgWrapper>
    )
}

TreeMap.propTypes = TreeMapPropTypes
TreeMap.displayName = 'TreeMap'

const enhancedTreeMap = enhance(TreeMap)
enhancedTreeMap.displayName = 'TreeMap'

export default memo(withContainer(enhancedTreeMap))
