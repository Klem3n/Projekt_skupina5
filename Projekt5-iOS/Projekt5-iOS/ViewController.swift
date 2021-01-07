//
//  ViewController.swift
//  Projekt5-iOS
//
//  Created by Matic on 06/01/2021.
//

import UIKit
import CoreLocation
import ARCL

class ViewController: UIViewController, CLLocationManagerDelegate {
    
    @IBOutlet weak var speedLabel: UILabel!
    @IBOutlet weak var latLabel: UILabel!
    @IBOutlet weak var lonLabel: UILabel!
    @IBOutlet weak var currentLocationLabel: UILabel!
    @IBOutlet weak var tresljajiLabel: UILabel!
    @IBOutlet weak var stanjeVoziscaStatusLabel: UILabel!
    
    @IBOutlet weak var radarButton: UIButton!
    @IBOutlet weak var kameraButton: UIButton!
    @IBOutlet weak var startArButton: UIButton!
    var locationManager: CLLocationManager?
    
    var shakeCount = 0
    var previousShakeCount = 0
    
    var currentLat = Double()
    var currentLon = Double()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        
        locationManager = CLLocationManager()
        locationManager?.delegate = self
        locationManager?.requestAlwaysAuthorization()
        locationManager?.desiredAccuracy = kCLLocationAccuracyBest
        locationManager?.startUpdatingLocation()
        
        self.kameraButton.applyGradient(colors: [Helpers.UIColorFromRGB(0x2B95CE).cgColor, Helpers.UIColorFromRGB(0x2ECAD5).cgColor])
        self.kameraButton.contentEdgeInsets = UIEdgeInsets(top: 10,left: 10,bottom: 10,right: 10)
        
        self.radarButton.applyGradient(colors: [Helpers.UIColorFromRGB(0x2B95CE).cgColor, Helpers.UIColorFromRGB(0x2ECAD5).cgColor])
        self.radarButton.contentEdgeInsets = UIEdgeInsets(top: 10,left: 10,bottom: 10,right: 10)
        
        self.startArButton.applyGradient(colors: [Helpers.UIColorFromRGB(0x2B95CE).cgColor, Helpers.UIColorFromRGB(0x2ECAD5).cgColor])
        self.startArButton.contentEdgeInsets = UIEdgeInsets(top: 10,left: 10,bottom: 10,right: 10)

    }
    
    override func becomeFirstResponder() -> Bool {
        return true
    }
    
    func locationManager(_ manager: CLLocationManager, didChangeAuthorization status: CLAuthorizationStatus) {
        if status == .authorizedAlways {
            if CLLocationManager.isMonitoringAvailable(for: CLBeaconRegion.self) {
                if CLLocationManager.isRangingAvailable() {
                    print("user allowed location - ranging available")
                }
            }
        }
    }
    
    func locationManager(_ manager: CLLocationManager,
                         didUpdateLocations locations: [CLLocation]) {
        
        guard let speed = manager.location?.speed else { return }
        if speed < 1 {
            DispatchQueue.main.async {
                self.speedLabel.text = "0 km/h"
            }
        } else {
            DispatchQueue.main.async {
                self.speedLabel.text = "\(Int(speed)) km/h"
            }
        }
        
        DispatchQueue.main.async {
            self.latLabel.text = "\(locations.first!.coordinate.latitude)"
            self.lonLabel.text = "\(locations.first!.coordinate.longitude)"
        }
        
        self.currentLat = locations.first!.coordinate.latitude
        self.currentLon = locations.first!.coordinate.longitude
        
        let geoCoder = CLGeocoder()
        let location = CLLocation(latitude: locations.first!.coordinate.latitude, longitude: locations.first!.coordinate.longitude)
        
        geoCoder.reverseGeocodeLocation(location) { (placemarks, _) in
            placemarks?.forEach { (placemark) in
                if let city = placemark.locality {
                    DispatchQueue.main.async {
                        self.currentLocationLabel.text = "\(city)"
                    }
                }
            }
            
        }
    }
    
    override func motionEnded(_ motion: UIEvent.EventSubtype, with event: UIEvent?) {
        if motion == .motionShake {
            print("shaken")
            previousShakeCount = shakeCount
            shakeCount += 1
            DispatchQueue.main.async {
                self.stanjeVoziscaStatusLabel.text = "Stanje vozišča slabo."
                self.tresljajiLabel.text = "Zaznavam tresljaje!"
            }
            
            var seconds = 10
            
            Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { timer in
                seconds -= 1
                if seconds == 0 && self.shakeCount > self.previousShakeCount {
                    DispatchQueue.main.async {
                        self.stanjeVoziscaStatusLabel.text = "Stanje vozišča dobro."
                        self.tresljajiLabel.text = "Ne zaznavam tresljajev."
                    }
                    timer.invalidate()
                } else {
                    print(seconds)
                    DispatchQueue.main.async {
                        self.tresljajiLabel.text = "Zaznavam tresljaje! \(seconds)"
                    }
                }
            }
            
        }
        
    }
    
    @IBAction func didReportRadar(_ sender: Any) {
        let alert = UIAlertController(title: "Prijava radarske kontrole", message: "Prijavim radar na trenutni lokaciji?", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Prekliči", style: .destructive, handler: { action in
              switch action.style {
              case .default:
                    print("default")
              case .cancel:
                    print("cancel")
              case .destructive:
                    print("destructive")
              @unknown default:
                print("Error")
              }}))
        alert.addAction(UIAlertAction(title: "Prijavi", style: .default, handler: { action in
              switch action.style {
              case .default:
                    print("default")
                    print("Send lat lon data to backend")
                    self.radarReportConfirmed()
              case .cancel:
                    print("cancel")
              case .destructive:
                    print("destructive")
              @unknown default:
                print("Error")
              }}))
        self.present(alert, animated: true, completion: nil)
    }
    
    func radarReportConfirmed() {
        let alert = UIAlertController(title: "Hvala", message: "Ostali uporabniki bodo na AR pogledu obveščeni o radarski kontroli.", preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Zapri", style: .default, handler: { action in
              switch action.style {
              case .default:
                    print("default")
              case .cancel:
                    print("cancel")
              case .destructive:
                    print("destructive")
              @unknown default:
                print("Error")
              }}))
        
        
        // converts lat long to address and sends it to backend
        convertLatLongToAddress(latitude: currentLat, longitude: currentLon)
    
        self.present(alert, animated: true, completion: nil)
    }
    
    
    let simpleClosure:(String) -> (String) = { name in
        
        let greeting = "Hello, World! " + "Program"
        return greeting
    }
    
    func convertLatLongToAddress(latitude:Double,longitude:Double) {
        
        let geoCoder = CLGeocoder()
        let location = CLLocation(latitude: latitude, longitude: longitude)
        geoCoder.reverseGeocodeLocation(location, completionHandler: { (placemarks, error) -> Void in
            
            // Place details
            var placeMark: CLPlacemark!
            placeMark = placemarks?[0]
            
            // Location name
            if let locationName = placeMark.location {
                print(locationName)
            }
            // Street address
            if let street = placeMark.thoroughfare {
                print(street)
            }
            // City
            if let city = placeMark.locality {
                print(city)
            }
            // State
            if let state = placeMark.administrativeArea {
                print(state)
            }
            // Zip code
            if let zipCode = placeMark.postalCode {
                print(zipCode)
            }
            // Country
            if let country = placeMark.country {
                print(country)
            }
            
            print(placeMark.country!)
            let s1 = placeMark.thoroughfare! + " "
            let s2 = s1 + placeMark.postalCode! + " "
            let s3 = s2 + placeMark.locality! + " "
            let addr = s3 + placeMark.country!
                
            let url = URL(string: "https://skupina5.loca.lt/api/v1/radarReport")!
            var request = URLRequest(url: url)
            let body = [
                "longitude": self.currentLon.description,
                "latitude": self.currentLat.description,
                "address": addr,
                "uuid": UIDevice.current.identifierForVendor!.uuidString
            ]
            //print(body)
            let bodyData = try? JSONSerialization.data(
                withJSONObject: body,
                options: []
            )
            // Change the URLRequest to a POST request
            request.httpMethod = "POST"
            request.httpBody = bodyData
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            let session = URLSession.shared
            let task = session.dataTask(with: request) { (data, response, error) in

                if let error = error {
                    // Handle HTTP request error
                } else if let data = data {
                    // Handle HTTP request response
                } else {
                    // Handle unexpected error
                }
            }
            task.resume()
            
        })
    }
    
    @IBAction func goToARView(_ sender: Any) {
        performSegue(withIdentifier: "arViewSegue", sender: sender)
    }
    
    
}


