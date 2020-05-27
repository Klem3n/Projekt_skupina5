package com.promet.app.activity;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import com.promet.R;

import org.opencv.android.OpenCVLoader;

public class MainActivity extends AppCompatActivity {

    static {
        if(OpenCVLoader.initDebug()){
            Log.d("MainActivity", "OpenCV configured successfully");
        } else {
            Log.d("MainActivity", "OpenCV configuration failed");
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button roadCamButton = findViewById(R.id.road_camera_button);

        roadCamButton.setOnClickListener((v)->{
            Intent intent = new Intent(this, RoadCamera.class);
            startActivity(intent);
        });
    }
}