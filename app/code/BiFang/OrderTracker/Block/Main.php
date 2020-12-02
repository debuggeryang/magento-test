<?php
/**
 * Magento Test
 */
namespace BiFang\OrderTracker\Block;

/**
 * Class Main
 * This Block is only for testing purpose.
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
    public function getOrderTrackData()
    {

        return array (
            'enabled' => '1',
            'dispatchTime' => (new \DateTime("now", new \DateTimeZone('Australia/Melbourne')))->format('c'),
            'dispatchNow' => true,
            'token' => 'pk.eyJ1IjoiZGVidWdnZXJ5YW5nIiwiYSI6ImNraTA4ZmpzOTFiYmIycXRob2wxajlwOW8ifQ.8qdYPNJ_YnIExDIdleL5Eg',
            'originAddress' => '1341 Dandenong Road  Chadstone  3148 Australia',
            'shippingAddress' => 'Unit 6 48-52 kanooka grove clayton Victoria 3168 Australia',
        );
    }
}
