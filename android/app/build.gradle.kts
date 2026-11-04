plugins {
  alias(libs.plugins.android.application)
}

android {
  namespace = "com.winamp.walkman"
  compileSdk = 34

  defaultConfig {
    applicationId = "com.winamp.walkman"
    minSdk = 24
    targetSdk = 34
    versionCode = 49
    versionName = "4.9"
  }

  buildTypes {
    debug {
      isDebuggable = true
    }
    release {
      isMinifyEnabled = false
      signingConfig = signingConfigs.getByName("debug")
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlin {
    jvmToolchain(17)
  }

  packaging {
    resources {
      excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
  }
}

dependencies {
  implementation(libs.androidx.core.ktx)
  implementation("androidx.appcompat:appcompat:1.7.0")
  implementation("androidx.webkit:webkit:1.12.1")
  implementation("androidx.media:media:1.7.0")
}
