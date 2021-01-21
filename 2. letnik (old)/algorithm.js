var dictionary = {}, 
    reverseDictionary = {};

var CoDepress = {    
    fillDictionary: function () {
        dictionary[-2] = "0000";
        dictionary[-1] = "0001";
        dictionary[1] = "0010";
        dictionary[2] = "0011";

        dictionary[-6] = "01000";
        dictionary[-5] = "01001";
        dictionary[-4] = "01010";
        dictionary[-3] = "01011";
        dictionary[6] = "01100";
        dictionary[5] = "01101";
        dictionary[4] = "01110";
        dictionary[3] = "01111";

        dictionary[-14] = "100000";
        dictionary[-13] = "100001";
        dictionary[-12] = "100010";
        dictionary[-11] = "100011";
        dictionary[-10] = "100100";
        dictionary[-9] = "100101";
        dictionary[-8] = "100110";
        dictionary[-7] = "100111";
        dictionary[14] = "101111";
        dictionary[13] = "101110";
        dictionary[12] = "101101";
        dictionary[11] = "101100";
        dictionary[10] = "101011";
        dictionary[9] = "101010";
        dictionary[8] = "101001";
        dictionary[7] = "101000";

        dictionary[-30] = "1100000";
        dictionary[-29] = "1100001";
        dictionary[-28] = "1100010";
        dictionary[-27] = "1100011";
        dictionary[-26] = "1100100";
        dictionary[-25] = "1100101";
        dictionary[-24] = "1100110";
        dictionary[-23] = "1100111";
        dictionary[-22] = "1101000";
        dictionary[-21] = "1101001";
        dictionary[-20] = "1101010";
        dictionary[-19] = "1101011";
        dictionary[-18] = "1101100";
        dictionary[-17] = "1101101";
        dictionary[-16] = "1101110";
        dictionary[-15] = "1101111";
        dictionary[30] = "1111111";
        dictionary[29] = "1111110";
        dictionary[28] = "1111101";
        dictionary[27] = "1111100";
        dictionary[26] = "1111011";
        dictionary[25] = "1111010";
        dictionary[24] = "1111001";
        dictionary[23] = "1111000";
        dictionary[22] = "1110111";
        dictionary[21] = "1110110";
        dictionary[20] = "1110101";
        dictionary[19] = "1110100";
        dictionary[18] = "1110011";
        dictionary[17] = "1110010";
        dictionary[16] = "1110001";
        dictionary[15] = "1110000";

        Object.keys(dictionary).forEach(function(key) {
            reverseDictionary[dictionary[key]] = key;
        });

        
    },

    compress: function (uncompressed) {
        var i,
            result = "";
        this.fillDictionary(dictionary);
        var encoded = [...uncompressed];
        var uncompressedCopy = [...uncompressed];

        for (i = 0; i < encoded.length; ++i) {
            var asciiValue= encoded[i].charCodeAt(0);
            if (i != 0)
            {
                var asciiValueLast = uncompressedCopy[i-1].charCodeAt(0);
                if (asciiValue == asciiValueLast)
                    encoded[i] = 0;
                else
                    encoded[i] = asciiValue - asciiValueLast;
            }
            else {
                encoded[i]=asciiValue;
            }
        }

        var flagZero = false;
        var numofZeroRepeats = 0;        
        var roleNum = -1;
        for (i = 0; i<uncompressed.length; ++i) {      
            var resultHelper = "";      
            var currentValue = encoded[i];
                     
            if (i == 0) {
                resultHelper=currentValue.toString(2).padStart(8, '0');
            }
            else if (currentValue == 0) {
                ++numofZeroRepeats;
                flagZero=true;
            }
            else if (currentValue != 0) {
                if (flagZero == true) {
                    roleNum=1;
                    resultHelper += roleNum.toString(2).padStart(2, '0');
                    let tmpZ= parseInt(numofZeroRepeats)-1;
                    resultHelper += (tmpZ).toString(2).padStart(3, '0'); 
                    result += resultHelper;
                    resultHelper='';
                    flagZero=false;
                    numofZeroRepeats=0;
                }
                if (Math.abs(currentValue) > 30) {
                    roleNum=2;
                    resultHelper += Math.abs(currentValue).toString(2).padStart(9, '0');
                    if (currentValue < 0)
                        resultHelper = '1' + resultHelper.substring(1);
                    resultHelper = roleNum.toString(2) + resultHelper; 
                }
                else {
                    roleNum=0;
                    resultHelper += roleNum.toString(2).padStart(2, '0');
                    resultHelper += dictionary[currentValue];  
                }
            }
            if (numofZeroRepeats == 8) {
                roleNum=1;
                resultHelper += roleNum.toString(2).padStart(2, '0');
                resultHelper += (numofZeroRepeats - 1).toString(2).padStart(3, '0'); 
                result += resultHelper;
                resultHelper='';
                flagZero=false;
                numofZeroRepeats=0;
            }
            if (i == uncompressed.length - 1) {
                if (flagZero) {                    
                    roleNum=1;
                    resultHelper += roleNum.toString(2).padStart(2, '0');
                    resultHelper += (numofZeroRepeats-1).toString(2).padStart(3, '0'); 
                    result += resultHelper;
                    resultHelper='';
                }
                roleNum=3;                
                resultHelper += roleNum.toString(2).padStart(2, '0');
            }
            result += resultHelper;
        }
        return result;
    },

    decompress: function (compressed) {        
        var i,
            result = "",
            decodedNumbers = [];

        this.fillDictionary(dictionary);

        var tmpNumber=0,
            bitCounter=0;
        
            console.log("A");
        while (compressed != "11")
        {
            if (bitCounter == 0)
            {
                tmpNumber = parseInt(compressed.substring(0,8), 2);
                decodedNumbers.push(tmpNumber);
                compressed = compressed.substring(8);
                bitCounter += 8;
            }
            else if (compressed.substring(0, 2) == "00")
            {
                compressed = compressed.substring(2);
                bitCounter += 2;
                if (compressed.substring(0, 2) == "00")
                {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 4)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(4);
                    bitCounter += 4;
                }
                else if (compressed.substring(0, 2) == "01")
                {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 5)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(5);
                    bitCounter += 5;
                }
                else if (compressed.substring(0, 2) == "10")
                {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 6)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(6);
                    bitCounter += 6;
                }
                else if (compressed.substring(0, 2) == "11")
                {
                    tmpNumber = parseInt(reverseDictionary[compressed.substring(0, 7)]);
                    decodedNumbers.push(tmpNumber);
                    compressed = compressed.substring(7);
                    bitCounter += 7;
                }
            }
            else if (compressed.substring(0, 2) == "01")
            {
                compressed = compressed.substring(2);
                bitCounter += 2;
                tmpNumber =  parseInt(compressed.substring(0, 3), 2);
                for (i = 0; i <= tmpNumber; ++i)
                    decodedNumbers.push(parseInt(0));
                compressed = compressed.substring(3);
                bitCounter += 3;
            }
            else if (compressed.substring(0, 2) == "10")
            {
                compressed = compressed.substring(2);
                bitCounter += 2;
                if (compressed.substring(0, 1) == "1")
                    tmpNumber = -parseInt(compressed.substring(1, 9), 2);
                else
                    tmpNumber = parseInt(compressed.substring(0, 9), 2);
                decodedNumbers.push(tmpNumber);
                compressed = compressed.substring(9);
                bitCounter += 9;
            }
        }
        for (i = 1; i < decodedNumbers.length; ++i)
        {
            decodedNumbers[i] += decodedNumbers[i - 1];
        }
        for (i=0; i<decodedNumbers.length; ++i) 
        {
            result += String.fromCharCode(decodedNumbers[i]);
        }
        return result;
    }
},
comp = CoDepress.compress("goooooooorankirov");
decomp = CoDepress.decompress(comp);
document.write(comp + '<br>' + decomp);