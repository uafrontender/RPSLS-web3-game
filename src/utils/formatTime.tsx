export const formatTime = (time: number) => {
    let minutes = Math.floor(time / 60)
    let seconds = time - minutes * 60
    return time > 0 ? `${minutes}:${seconds}` : 0
}