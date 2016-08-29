/*jslint browser:true, this:true, for:true*/
/*global $, jQuery*/

var score = 0,
    listItemHeight = $(".slotDigitsRef").first().height();

// Function to check if all values in an array are same or not
function areAllDigitsSame(targetArray) {
    'use strict';
    var arrLength,
        i,
        allValSame = true;
    arrLength = targetArray.length;
    if (arrLength < 1) {
        return false;
    }
    for (i = 1; i < arrLength; i += 1) {
        if (targetArray[i] !== targetArray[0]) {
            allValSame = false;
        }
    }
    return allValSame;
}

/* Returns an integer based on difficulty level
 * Difficulty level 1 is for no added difficulty
 * For difficulty level > 1, we are using (y=x*x+x) parabolic equation
 * Considering the constants a, b and c as 1, 1 and 0 respectively in eq. y = a*x*x*+b*x+c
 * As difficulty increases, maximum iterations to generate the number increases
 * Thereby making winning difficult as the user levels up
*/
function getLevelInt(min, max, difficulty) {
    'use strict';
    var iteration = 1,
        x,
        generatedNum,
        genArray,
        i;
    if (difficulty > 1) {
        x = difficulty - 1;
        iteration = x * x + x;
    }
    for (i = 0; i < iteration; i += 1) {
        generatedNum = Math.floor(Math.random() * (max - min + 1)) + min;
        genArray = generatedNum + "";
        genArray = genArray.split(""); // convert to array
        if (!areAllDigitsSame(genArray)) {
            break; // no need to iterate further; user has failed this level, play again!
        }
    }
    return generatedNum;
}

// Execute when user clicks on play button
$("#play").on("click", function () {
    'use strict';
    var resultArr = [],
        i,
        allValSame,
        $this = $(this),
        delay = 0,
        loopCounter = 0,
        slotResult,
        difficulty,
        pad = "000";

    $("#slotPanel").empty();
    for (i = 0; i < 3; i += 1) {
        // populate and append the slots
        $(".slotDigitsRef").first().clone().removeClass("slotDigitsRef hidden").appendTo("#slotPanel");
    }
    $this.html("Rolling...").attr("disabled", "disabled"); // prevent unwanted user button click
    var noOfSlots = $(".slotDigits:not(.slotDigitsRef)").length;
    difficulty = parseInt($("#difficulty").html()); // get the existing game difficulty level
    slotResult = getLevelInt(0, 999, difficulty) + ""; // convert the result to string for array operations
    if (slotResult < 100) {
        slotResult = pad.substring(0, pad.length - slotResult.length) + slotResult; // left pad numbers that are less than 3 digits long
    }
    slotResult = slotResult.split(""); // convert to array
    $(".slotDigits:not(.slotDigitsRef)").each(function () {
        var rotateTop,
            allItem,
            that;
        loopCounter += 1;
        resultArr.push(slotResult[loopCounter - 1]);
        rotateTop = listItemHeight * slotResult[loopCounter - 1];
        allItem = listItemHeight * 10;
        that = $(this);
        that.css('top', -allItem);
        // slot rolling
        that.delay(delay).animate({
            'top': 0
        }, 500, 'linear', function () {
            that.css('top', -rotateTop);
        });
        delay += 500; // increase delay for following element
        if (noOfSlots === loopCounter) { // check last slot
            that.promise().done(function () { // on successful completion of all animations show result
                allValSame = areAllDigitsSame(resultArr);
                if (allValSame) {
                    $("#score").html(parseInt($("#score").html()) + 1);
                    $("#difficulty").html(parseInt($("#difficulty").html()) + 1);
                    $this.html("You won! Play again!").removeAttr("disabled");
                } else {
                    $this.html("Try again").removeAttr("disabled");
                }
            });
        }
    });
});