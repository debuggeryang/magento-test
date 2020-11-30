<?php
/**
 * 
 */
namespace BiFang\OrderTracker\Controller\Index;
/**
 * Undocumented class
 */
class Index extends \Magento\Framework\App\Action\Action
{
    /**
     * Undocumented variable
     *
     * @var [type]
     */
    protected $resultPageFactory;
    /**
     * Undocumented function
     *
     * @param \Magento\Framework\App\Action\Context $context
     * @param \Magento\Framework\View\Result\PageFactory $resultPageFactory
     */
    public function __construct(
        \Magento\Framework\App\Action\Context $context,
        \Magento\Framework\View\Result\PageFactory $resultPageFactory)
    {
        $this->resultPageFactory = $resultPageFactory;
        parent::__construct($context);
    }

    /**
     * Undocumented function
     *
     * @return void
     */
    public function execute()
    {
        // $zend_logger = new \Zend\Log\Logger();
        // $zend_logger->addWriter(new \Zend\Log\Writer\Stream(BP . '/var/log/events2.log'));
        // $zend_logger->info("hello details const2");
        return $this->resultPageFactory->create();
    }
}
