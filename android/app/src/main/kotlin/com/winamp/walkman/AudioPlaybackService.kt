package com.winamp.walkman

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.BitmapFactory
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import androidx.core.app.NotificationCompat

class AudioPlaybackService : Service() {

    companion object {
        const val CHANNEL_ID = "winamp_audio_channel"
        const val NOTIFICATION_ID = 1001

        const val ACTION_UPDATE_TRACK = "com.winamp.walkman.ACTION_UPDATE_TRACK"
        const val ACTION_PLAY = "com.winamp.walkman.ACTION_PLAY"
        const val ACTION_PAUSE = "com.winamp.walkman.ACTION_PAUSE"
        const val ACTION_PREV = "com.winamp.walkman.ACTION_PREV"
        const val ACTION_NEXT = "com.winamp.walkman.ACTION_NEXT"
        const val ACTION_STOP = "com.winamp.walkman.ACTION_STOP"

        const val EXTRA_TITLE = "extra_title"
        const val EXTRA_ARTIST = "extra_artist"
        const val EXTRA_IS_PLAYING = "extra_is_playing"

        var isServiceRunning = false
            private set
    }

    private var mediaSession: MediaSessionCompat? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var currentTitle = "Winamp Walkman"
    private var currentArtist = "Digital Audio Player"
    private var isPlaying = false

    override fun onCreate() {
        super.onCreate()
        isServiceRunning = true

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "WinampWalkman:AudioPlaybackWakeLock"
        ).apply {
            setReferenceCounted(false)
        }

        createNotificationChannel()
        initMediaSession()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Winamp Audio Playback",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background playback controls for Winamp Walkman"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun initMediaSession() {
        mediaSession = MediaSessionCompat(this, "WinampMediaSession").apply {
            setFlags(
                MediaSessionCompat.FLAG_HANDLES_MEDIA_BUTTONS or
                MediaSessionCompat.FLAG_HANDLES_TRANSPORT_CONTROLS
            )

            setCallback(object : MediaSessionCompat.Callback() {
                override fun onPlay() {
                    MainActivity.instance?.sendJsMediaAction("play")
                }

                override fun onPause() {
                    MainActivity.instance?.sendJsMediaAction("pause")
                }

                override fun onSkipToNext() {
                    MainActivity.instance?.sendJsMediaAction("next")
                }

                override fun onSkipToPrevious() {
                    MainActivity.instance?.sendJsMediaAction("previous")
                }

                override fun onStop() {
                    MainActivity.instance?.sendJsMediaAction("pause")
                    stopSelf()
                }
            })

            isActive = true
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        when (action) {
            ACTION_UPDATE_TRACK -> {
                currentTitle = intent.getStringExtra(EXTRA_TITLE) ?: "Winamp Walkman"
                currentArtist = intent.getStringExtra(EXTRA_ARTIST) ?: ""
                isPlaying = intent.getBooleanExtra(EXTRA_IS_PLAYING, true)

                if (isPlaying) {
                    try {
                        if (wakeLock?.isHeld == false) wakeLock?.acquire(3600000L) // 1 hour max safety timeout
                    } catch (_: Exception) {}
                } else {
                    try {
                        if (wakeLock?.isHeld == true) wakeLock?.release()
                    } catch (_: Exception) {}
                }

                updateMediaSessionState()
                val notification = buildNotification()
                startForeground(NOTIFICATION_ID, notification)
            }
            ACTION_PLAY -> {
                MainActivity.instance?.sendJsMediaAction("play")
            }
            ACTION_PAUSE -> {
                MainActivity.instance?.sendJsMediaAction("pause")
            }
            ACTION_PREV -> {
                MainActivity.instance?.sendJsMediaAction("previous")
            }
            ACTION_NEXT -> {
                MainActivity.instance?.sendJsMediaAction("next")
            }
            ACTION_STOP -> {
                try {
                    if (wakeLock?.isHeld == true) wakeLock?.release()
                } catch (_: Exception) {}
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }

        return START_NOT_STICKY
    }

    private fun updateMediaSessionState() {
        val stateBuilder = PlaybackStateCompat.Builder()
            .setActions(
                PlaybackStateCompat.ACTION_PLAY or
                PlaybackStateCompat.ACTION_PAUSE or
                PlaybackStateCompat.ACTION_PLAY_PAUSE or
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                PlaybackStateCompat.ACTION_STOP
            )
            .setState(
                if (isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED,
                PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN,
                1.0f
            )

        mediaSession?.setPlaybackState(stateBuilder.build())

        val metadataBuilder = MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, currentTitle)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, currentArtist)
            .putString(MediaMetadataCompat.METADATA_KEY_ALBUM, "Winamp Walkman")

        mediaSession?.setMetadata(metadataBuilder.build())
    }

    private fun buildNotification(): Notification {
        val contentIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val prevIntent = PendingIntent.getService(
            this, 1, Intent(this, AudioPlaybackService::class.java).setAction(ACTION_PREV),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val playPauseAction = if (isPlaying) {
            val pauseIntent = PendingIntent.getService(
                this, 2, Intent(this, AudioPlaybackService::class.java).setAction(ACTION_PAUSE),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            NotificationCompat.Action.Builder(
                android.R.drawable.ic_media_pause, "Pause", pauseIntent
            ).build()
        } else {
            val playIntent = PendingIntent.getService(
                this, 2, Intent(this, AudioPlaybackService::class.java).setAction(ACTION_PLAY),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            NotificationCompat.Action.Builder(
                android.R.drawable.ic_media_play, "Play", playIntent
            ).build()
        }

        val nextIntent = PendingIntent.getService(
            this, 3, Intent(this, AudioPlaybackService::class.java).setAction(ACTION_NEXT),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val mediaStyle = androidx.media.app.NotificationCompat.MediaStyle()
            .setMediaSession(mediaSession?.sessionToken)
            .setShowActionsInCompactView(0, 1, 2)

        val largeIcon = try {
            BitmapFactory.decodeResource(resources, R.mipmap.ic_launcher)
        } catch (_: Exception) {
            null
        }

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(currentTitle)
            .setContentText(if (currentArtist.isNotEmpty()) currentArtist else "Winamp Walkman v4.9")
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setLargeIcon(largeIcon)
            .setContentIntent(contentIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(isPlaying)
            .addAction(android.R.drawable.ic_media_previous, "Previous", prevIntent)
            .addAction(playPauseAction)
            .addAction(android.R.drawable.ic_media_next, "Next", nextIntent)
            .setStyle(mediaStyle)

        return builder.build()
    }

    override fun onDestroy() {
        isServiceRunning = false
        mediaSession?.release()
        try {
            if (wakeLock?.isHeld == true) wakeLock?.release()
        } catch (_: Exception) {}
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
