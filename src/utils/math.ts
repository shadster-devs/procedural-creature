
export const constrainAngle = (angle: number, anchor : number, constraint : number) => {
    const diff = relativeAngleDiff(angle, anchor)
    if (Math.abs(diff) <= constraint) {
        return simplifyAngle(angle)
    }
    return simplifyAngle(anchor + (diff > 0 ? -constraint : constraint))
}

export const relativeAngleDiff = (angle: number, anchor : number) => {
    angle = simplifyAngle(angle + Math.PI - anchor)
    anchor = Math.PI
    return anchor - angle
}

export const simplifyAngle = (angle: number) => {
    while (angle >= Math.PI * 2) angle -= Math.PI * 2
    while (angle < 0) angle += Math.PI * 2
    return angle
}

