package com.promet.app.activity;

import androidx.appcompat.app.AppCompatActivity;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.location.Location;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.SurfaceView;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;

import com.github.kevinsawicki.http.HttpRequest;
import com.promet.R;
import com.promet.app.api.PostAPI;
import com.promet.app.opencv.SignDetection;

import org.opencv.android.BaseLoaderCallback;
import org.opencv.android.CameraBridgeViewBase;
import org.opencv.android.JavaCameraView;
import org.opencv.android.OpenCVLoader;
import org.opencv.android.Utils;
import org.opencv.core.Core;
import org.opencv.core.CvException;
import org.opencv.core.CvType;
import org.opencv.core.Mat;
import org.opencv.core.Rect;
import org.opencv.imgproc.Imgproc;

import java.io.BufferedWriter;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import javax.net.ssl.HttpsURLConnection;

public class RoadCamera extends AppCompatActivity implements CameraBridgeViewBase.CvCameraViewListener2 {

    JavaCameraView roadCamera;

    Mat cameraView;
    Mat cameraViewT;

    SignDetection signDetection;
    ImageView snapView;

    final Handler handler = new Handler();

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

        snapView = findViewById(R.id.snap_view);
        Button scan = findViewById(R.id.button_scan);

        scan.setOnClickListener((v)->{
            runDetection();
        });


        snapView.setOnClickListener((v)->{
            snapView.setVisibility(View.INVISIBLE);
        });
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

        return cameraView;
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

    private void runDetection() {
        SignDetection.Detection detection = signDetection.run(cameraView);

        Bitmap bmp = null;
        try {
            bmp = Bitmap.createBitmap(detection.clone.cols(), detection.clone.rows(), Bitmap.Config.ARGB_8888);
            Utils.matToBitmap(detection.clone, bmp);
            snapView.setImageBitmap(bmp);

            snapView.setVisibility(View.VISIBLE);
        }
        catch (CvException e){Log.d("Exception",e.getMessage());}

        if(detection.success){
            try {
                postLocationData(Arrays.asList(detection.names).stream().filter(Objects::nonNull).collect(Collectors.toList()));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    private void postLocationData(List<String> znaki) throws IOException {
        if(MainActivity.location == null)
            return;

        Map<String, String> params = new HashMap<>();

        params.put("uuid", MainActivity.location.getLongitude() + "" + MainActivity.location.getLatitude());
        params.put("longitude", String.valueOf(MainActivity.location.getLongitude()));
        params.put("latitude", String.valueOf(MainActivity.location.getLatitude()));
        params.put("address", MainActivity.geocoder.getFromLocation(MainActivity.location.getLatitude(), MainActivity.location.getLongitude(), 1).get(0).getAddressLine(0));
        params.put("name", Arrays.toString(znaki.toArray()));

        new PostAPI().execute("http://192.168.0.28:5000/api/v1/lokacija", MainActivity.getPostDataString(params));
    }
}
