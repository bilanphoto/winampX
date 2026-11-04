package com.winamp.walkman

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.WindowManager
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader

class MainActivity : AppCompatActivity() {

    companion object {
        var instance: MainActivity? = null
            private set
    }

    private lateinit var webView: WebView
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult

        val uris: Array<Uri>? = if (result.resultCode == RESULT_OK && result.data != null) {
            val clipData = result.data?.clipData
            if (clipData != null && clipData.itemCount > 0) {
                Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            } else {
                result.data?.data?.let { arrayOf(it) }
            }
        } else {
            null
        }

        fileUploadCallback?.onReceiveValue(uris)
        fileUploadCallback = null
    }

    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { _ -> }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        instance = this

        // Dark status bar and navigation bar styling
        window.statusBarColor = 0xFF111317.toInt()
        window.navigationBarColor = 0xFF111317.toInt()

        // Keep screen on while interacting
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)

        webView = WebView(this).apply {
            id = View.generateViewId()
            setBackgroundColor(0xFF0D0E12.toInt())
            isVerticalScrollBarEnabled = false
            isHorizontalScrollBarEnabled = false
        }
        setContentView(webView)

        setupWebView()
        requestPermissionsIfNeeded()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    // Minimize instead of destroying activity to keep playback seamless
                    moveTaskToBack(true)
                }
            }
        })
    }

    private fun requestPermissionsIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val assetLoader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mediaPlaybackRequiresUserGesture = false
            useWideViewPort = true
            loadWithOverviewMode = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? {
                return assetLoader.shouldInterceptRequest(request.url)
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                // Register Android Bridge readiness
                view?.evaluateJavascript(
                    "window.__ANDROID_NATIVE__ = true; window.dispatchEvent(new Event('android-native-ready'));",
                    null
                )
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                return super.onConsoleMessage(consoleMessage)
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "audio/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                    addCategory(Intent.CATEGORY_OPENABLE)
                }
                filePickerLauncher.launch(Intent.createChooser(intent, "Select Audio Files"))
                return true
            }
        }

        webView.addJavascriptInterface(AndroidBridge(), "AndroidBridge")

        // Load the local appassets web app
        webView.loadUrl("https://appassets.androidplatform.net/assets/web/index.html")
    }

    fun sendJsMediaAction(action: String) {
        runOnUiThread {
            webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('android-media-control', { detail: { action: '$action' } }));",
                null
            )
        }
    }

    inner class AndroidBridge {
        @JavascriptInterface
        fun onPlaybackStateChanged(
            isPlaying: Boolean,
            title: String,
            artist: String,
            durationMs: Long,
            positionMs: Long
        ) {
            val intent = Intent(this@MainActivity, AudioPlaybackService::class.java).apply {
                action = AudioPlaybackService.ACTION_UPDATE_TRACK
                putExtra(AudioPlaybackService.EXTRA_TITLE, title)
                putExtra(AudioPlaybackService.EXTRA_ARTIST, artist)
                putExtra(AudioPlaybackService.EXTRA_IS_PLAYING, isPlaying)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }
        }

        @JavascriptInterface
        fun stopAudioService() {
            val intent = Intent(this@MainActivity, AudioPlaybackService::class.java).apply {
                action = AudioPlaybackService.ACTION_STOP
            }
            startService(intent)
        }
    }

    override fun onResume() {
        super.onResume()
        // Do NOT pause WebView timers in onPause/onResume so audio plays smoothly
    }

    override fun onDestroy() {
        if (instance == this) instance = null
        super.onDestroy()
    }
}
