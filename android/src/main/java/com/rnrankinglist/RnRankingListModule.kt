package com.rnrankinglist

import com.facebook.react.bridge.ReactApplicationContext

class RnRankingListModule(reactContext: ReactApplicationContext) :
  NativeRnRankingListSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeRnRankingListSpec.NAME
  }
}
