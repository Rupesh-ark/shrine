let _analyser: AnalyserNode | null = null
let _dataArray: Uint8Array | null = null

export function setAudioAnalyser(analyser: AnalyserNode | null) {
  _analyser = analyser
  if (analyser) {
    _dataArray = new Uint8Array(analyser.frequencyBinCount)
  } else {
    _dataArray = null
  }
}

export function getFrequencyData(): Uint8Array | null {
  if (!_analyser || !_dataArray) return null
  _analyser.getByteFrequencyData(_dataArray)
  return _dataArray
}
