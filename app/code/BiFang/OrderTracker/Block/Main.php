<?php
/**
 * 
 */
namespace BiFang\OrderTracker\Block;

/**
 * Class Main
 */
class Main extends \Magento\Framework\View\Element\Template
{
    /**
     * Undocumented function
     *
     * @return void
     */
    function _prepareLayout()
    {
    }

    /**
     * Undocumented function
     *
     * @return array
     */
    public function getOrderTrackData() {
        return array (
            'enabled' => '1',
            'cutoffTime' => '15,00,00',
            'token' => 'pk.eyJ1IjoiZGVidWdnZXJ5YW5nIiwiYSI6ImNraTA4ZmpzOTFiYmIycXRob2wxajlwOW8ifQ.8qdYPNJ_YnIExDIdleL5Eg',
            'originAddress' => '1341 Dandenong Road  Chadstone  3148 Australia',
            'shippingAddress' => '48 kanooka grove clayton Victoria 3168 Australia',
        );
    }
}
