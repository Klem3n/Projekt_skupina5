package com.promet.app.activity;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.view.SurfaceView;

import com.promet.R;
import com.promet.app.opencv.SignDetection;

import org.opencv.android.BaseLoaderCallback;
import org.opencv.android.CameraBridgeViewBase;
import org.opencv.android.JavaCameraView;
import org.opencv.android.OpenCVLoader;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.imgproc.Imgproc;

import java.io.IOException;

public class RoadCamera extends AppCompatActivity implements CameraBridgeViewBase.CvCameraViewListener2 {

    JavaCameraView roadCamera;

    Mat cameraView;
    Mat cameraViewT;

    SignDetection signDetection;

    BaseLoaderCallback baseLoaderCallback = new BaseLoaderCallback(RoadCamera.this) {
        @Override
        public void onManagerConnected(int status) {
            switch (status){
                case BaseLoaderCallback.SUCCESS:
                {
                    roadCamera.enableView();
                }
                default:
                    super.onManagerConnected(status);
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_road_camera);

        roadCamera = findViewById(R.id.road_camera_view);
        roadCamera.setVisibility(SurfaceView.VISIBLE);
        roadCamera.setCvCameraViewListener(this);

        try {
            signDetection = new SignDetection(this);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onCameraViewStarted(int width, int height) {
        cameraView = new Mat(height, width, CvType.CV_8UC4);
    }

    @Override
    public void onCameraViewStopped() {
        cameraView.release();
    }

    @Override
    public Mat onCameraFrame(CameraBridgeViewBase.CvCameraViewFrame inputFrame) {
        cameraView = inputFrame.rgba();

        Imgproc.cvtColor(cameraView, cameraView, Imgproc.COLOR_RGBA2BGRA);

        //cameraViewT = cameraView.t();
        //Core.flip(cameraView.t(), cameraViewT, 1);
        //Imgproc.resize(cameraViewT, cameraViewT, cameraView.size());

        return signDetection.run(cameraView);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();

        if(roadCamera != null){
            roadCamera.disableView();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();

        if(roadCamera != null){
            roadCamera.disableView();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        if(OpenCVLoader.initDebug()){
            Log.d("MainActivity", "OpenCV configured successfully");
            baseLoaderCallback.onManagerConnected(BaseLoaderCallback.SUCCESS);
        } else {
            Log.d("MainActivity", "OpenCV configuration failed");
            OpenCVLoader.initAsync(OpenCVLoader.OPENCV_VERSION, this, baseLoaderCallback);
        }
    }
}
