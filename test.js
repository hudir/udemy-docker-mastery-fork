// 88. Merge Sorted Array

/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place instead.
 */
var merge = function(nums1, m, nums2, n) {
    for (let i = 0; i < m+n ; i ++) {
        
        const currentNum = nums2[0];
        if (!nums1[i] && nums2.length > 0)  {
            if(nums1[i] === 0 ) nums1.splice(i , 1 , nums2.shift())
            else nums1.splice(i , 0 , nums2.shift())
        }  else if(nums1[i] <= currentNum && (nums1[i+1] >= currentNum || !nums1[i+1])) {
            nums1.splice(i + 1 , 0 , nums2.shift())
        } else if (!nums1[i] && nums2.length === 0)  {
            nums1.splice(i);
            break
        } else if (i===0 && nums1[i] > currentNum) {
            nums1.unshift(nums2.shift());
        }
    }

    nums1.splice(m+n)
};


nums1 = [2, 0]

nums2 = [1]

merge(nums1, 2, nums2, 1)
console.log(nums1)


