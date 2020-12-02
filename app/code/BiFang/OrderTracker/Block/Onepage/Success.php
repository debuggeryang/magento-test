<?php
/**
 * Magento Test
 */
namespace BiFang\OrderTracker\Block\Onepage;

use Magento\Customer\Model\Context;
use Magento\Sales\Model\Order;

/**
 * One page checkout success page
 */
class Success extends \Magento\Checkout\Block\Onepage\Success
{
    /**
     * @var \Magento\Checkout\Model\Session
     */
    protected $_checkoutSession;

    /**
     * @var \Magento\Sales\Model\Order\Config
     */
    protected $_orderConfig;

    /**
     * @var \Magento\Framework\App\Http\Context
     */
    protected $httpContext;

    /**
     * @var \Magento\Framework\App\Config\ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * @var \Magento\Directory\Model\CountryFactory
     */
    protected $countryFactory;

        /**
         * @var \Magento\Directory\Model\RegionFactory
         */
    protected $regionFactory;


    /**
     * @param \Magento\Framework\View\Element\Template\Context   $context
     * @param \Magento\Checkout\Model\Session                    $checkoutSession
     * @param \Magento\Sales\Model\Order\Config                  $orderConfig
     * @param \Magento\Framework\App\Http\Context                $httpContext
     * @param \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
     * @param \Magento\Directory\Model\CountryFactory            $countryFactory
     * @param \Magento\Directory\Model\RegionFactory             $regionFactory
     * @param array                                              $data
     */
    public function __construct(
        \Magento\Framework\View\Element\Template\Context $context,
        \Magento\Checkout\Model\Session $checkoutSession,
        \Magento\Sales\Model\Order\Config $orderConfig,
        \Magento\Framework\App\Http\Context $httpContext,
        \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig,
        \Magento\Directory\Model\CountryFactory $countryFactory,
        \Magento\Directory\Model\RegionFactory $regionFactory,
        array $data = []
    ) {
        parent::__construct($context, $checkoutSession, $orderConfig, $httpContext, $data);
        $this->scopeConfig = $scopeConfig;
        $this->countryFactory = $countryFactory;
        $this->regionFactory = $regionFactory;
    }

    /**
     * Initialize data and prepare it for output
     *
     * @return string
     */
    protected function _beforeToHtml()
    {
        $this->prepareBlockData();
        return parent::_beforeToHtml();
    }

    /**
     * Prepares block data
     *
     * @return void
     */
    protected function prepareBlockData()
    {
        
        $order = $this->_checkoutSession->getLastRealOrder();

        $this->addData(
            [
                'is_order_visible' => $this->isVisible($order),
                'view_order_url' => $this->getUrl(
                    'sales/order/view/',
                    ['order_id' => $order->getEntityId()]
                ),
                'print_url' => $this->getUrl(
                    'sales/order/print',
                    ['order_id' => $order->getEntityId()]
                ),
                'can_print_order' => $this->isVisible($order),
                'can_view_order'  => $this->canViewOrder($order),
                'order_id'  => $order->getIncrementId()
            ]
        );

    }

    /**
     * Is order visible
     *
     * @param  Order $order
     * @return bool
     */
    protected function isVisible(Order $order)
    {
        return !in_array(
            $order->getStatus(),
            $this->_orderConfig->getInvisibleOnFrontStatuses()
        );
    }

    /**
     * Can view order
     *
     * @param  Order $order
     * @return bool
     */
    protected function canViewOrder(Order $order)
    {
        return $this->httpContext->getValue(Context::CONTEXT_AUTH)
            && $this->isVisible($order);
    }

    /**
     * Get origin address, mapbox token and dispatch time
     *
     * @return void
     */
    public function getOrderTrackData() 
    {
        $order = $this->_checkoutSession->getLastRealOrder();
        $enableOrderTracker = $this->scopeConfig->getValue('shipping/ordertracker/active');
        
        $orderTrackData = [
            'enabled' => $enableOrderTracker,
            'dipsatchTime' => '',
            'dispatchNow' => false,
            'token' => '',
            'originAddress' => '',
            'shippingAddress' => ''
        ];

        if (!$enableOrderTracker) {
            return $orderTrackData;
        }

        $orderTrackData['token'] = $this->scopeConfig->getValue('shipping/ordertracker/mapbox_key');
        
        $countryCode = $this->scopeConfig->getValue('shipping/origin/country_id');
        $countryName = $this->countryFactory->create()->loadByCode($countryCode)->getName();
        $regionCode = $this->scopeConfig->getValue('shipping/origin/region_id');
        $regionName = $this->regionFactory->create()->loadByCode($regionCode, $countryCode)->getName();
        $postcode = $this->scopeConfig->getValue('shipping/origin/postcode');
        $city = $this->scopeConfig->getValue('shipping/origin/city');
        $street_line1 = $this->scopeConfig->getValue('shipping/origin/street_line1');
        $street_line2 = $this->scopeConfig->getValue('shipping/origin/street_line2');
        $orderTrackData['originAddress'] = $street_line1 . ' ' . $street_line2 . ' ' . $city . ' ' . $regionName . ' ' . $postcode . ' ' . $countryName;
        
        $orderShippingAddress = $order->getShippingAddress();
        $shippingAddressCountryName = $this->countryFactory->create()->loadByCode($orderShippingAddress->getCountryId())->getName();
        $shippingAddressRegion = $orderShippingAddress->getRegion();
        $shippingAddressPostcode = $orderShippingAddress->getPostcode();
        $shippingAddressCity = $orderShippingAddress->getCity();
        $shippingAddressStreets = $orderShippingAddress->getStreet();
        $orderTrackData['shippingAddress'] = implode(' ', $shippingAddressStreets) . ' ' .
            $shippingAddressCity . ' ' . 
            $shippingAddressRegion . ' ' .
            $shippingAddressPostcode . ' ' .
            $shippingAddressCountryName;
        
        $cutoffHour = intval(explode(',', $this->scopeConfig->getValue('shipping/ordertracker/cut_off'))[0]);
        $timeZone = new \DateTimeZone($this->scopeConfig->getValue('general/locale/timezone'));
        $currentTime = new \DateTime("now", $timeZone);
        $currentDay = $currentTime->format('l');

        if ($currentDay == "Saturday" || $currentDay == "Sunday") {
            $dispatchTime = new \DateTime("next monday", $timeZone);
            $dispatchTime->modify('+8 hours');
        } elseif ($cutoffHour <= $currentTime->format('H')) {
            $dispatchTime = new \DateTime("tomorrow", $timeZone);
            $dispatchTime->modify('+8 hours');
        } elseif ($currentTime->format('H') < 6) {
            $dispatchTime = $currentTime;
            $dispatchTime->setTime(8, 0, 0);
        } else {
            $dispatchTime = $currentTime;
            $orderTrackData['dispatchNow'] = true;
        }
        $orderTrackData['dispatchTime'] = $dispatchTime->format('c');
        return $orderTrackData;
    }
}
