export const formatTime = (time: number) : string | 0 => {
    let minutes = Math.floor(time / 60)
    let seconds = time - minutes * 60
    return time > 0 ? `${minutes}:${seconds}` : 0
}